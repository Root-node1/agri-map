const axios = require('axios');
const logger = require('../utils/logger');
const { cacheSet, cacheGet } = require('../config/redis');

class WebhookService {
  constructor() {
    this.webhookConfigs = new Map();
    this.retryQueue = [];
    this.defaultTimeout = 5000;
    this.maxRetries = 3;
    this.registeredWebhooks = {
      'loan.approved': process.env.WEBHOOK_LOAN_APPROVED,
      'loan.disbursed': process.env.WEBHOOK_LOAN_DISBURSED,
      'carbon.verified': process.env.WEBHOOK_CARBON_VERIFIED,
      'payment.confirmed': process.env.WEBHOOK_PAYMENT_CONFIRMED,
      'carbon.credit.minted': `${process.env.WEBHOOK_BASE_URL}/carbon-credit-minted`,
      'wallet.updated': `${process.env.WEBHOOK_BASE_URL}/wallet-updated`,
      'user.registered': `${process.env.WEBHOOK_BASE_URL}/user-registered`,
    };

    // Register default webhooks
    Object.entries(this.registeredWebhooks).forEach(([event, url]) => {
      if (url) {
        this.registerWebhook(event, url);
      }
    });
  }

  registerWebhook(event, url, config = {}) {
    if (!this.webhookConfigs.has(event)) {
      this.webhookConfigs.set(event, []);
    }
    
    const webhook = {
      url,
      retries: 0,
      maxRetries: config.maxRetries || this.maxRetries,
      timeout: config.timeout || this.defaultTimeout,
      headers: config.headers || {},
      active: true,
    };
    
    this.webhookConfigs.get(event).push(webhook);
    logger.info(`Webhook registered for event: ${event} -> ${url}`);
  }

  async sendWebhook(event, data, options = {}) {
    const webhooks = this.webhookConfigs.get(event) || [];
    
    if (webhooks.length === 0) {
      logger.debug(`No webhooks registered for event: ${event}`);
      return;
    }

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      source: 'agrimap-node-backend',
      environment: process.env.NODE_ENV,
    };

    const results = [];
    for (const webhook of webhooks) {
      if (!webhook.active) continue;
      
      try {
        const result = await this.sendWebhookRequest(webhook, payload, options);
        results.push({ url: webhook.url, success: true, result });
      } catch (error) {
        logger.error(`Webhook failed for ${webhook.url}:`, error.message);
        results.push({ url: webhook.url, success: false, error: error.message });
        
        // Retry logic
        await this.handleRetry(webhook, payload, error);
      }
    }

    return results;
  }

  async sendWebhookRequest(webhook, payload, options = {}) {
    const timeout = options.timeout || webhook.timeout || this.defaultTimeout;
    
    const response = await axios.post(webhook.url, payload, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Source': 'agrimap-node-backend',
        ...webhook.headers,
      },
      ...options,
    });

    if (response.status >= 200 && response.status < 300) {
      logger.info(`Webhook sent to ${webhook.url} for event ${payload.event}`);
      return response.data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async handleRetry(webhook, payload, error) {
    const retryCount = webhook.retries || 0;
    
    if (retryCount < webhook.maxRetries) {
      webhook.retries = retryCount + 1;
      
      // Exponential backoff
      const delay = Math.pow(2, webhook.retries) * 1000;
      
      logger.info(`Retrying webhook (${webhook.retries}/${webhook.maxRetries}) for ${webhook.url} in ${delay}ms`);
      
      setTimeout(async () => {
        try {
          await this.sendWebhookRequest(webhook, payload);
          webhook.retries = 0; // Reset on success
        } catch (retryError) {
          logger.error(`Retry failed for ${webhook.url}:`, retryError.message);
          
          if (webhook.retries >= webhook.maxRetries) {
            // Add to retry queue for later processing
            this.retryQueue.push({
              webhook,
              payload,
              timestamp: Date.now(),
              attempts: 0,
            });
          }
        }
      }, delay);
    } else {
      // Add to retry queue
      this.retryQueue.push({
        webhook,
        payload,
        timestamp: Date.now(),
        attempts: 0,
      });
      logger.error(`Webhook failed after max retries: ${webhook.url}`);
    }
  }

  async processRetryQueue() {
    const now = Date.now();
    const processed = [];

    for (const item of this.retryQueue) {
      const timeSinceFailure = now - item.timestamp;
      
      // Retry after 5 minutes, then 15 minutes, then 30 minutes
      const retryDelays = [300000, 900000, 1800000]; // 5min, 15min, 30min
      const delay = retryDelays[item.attempts] || 3600000; // 1 hour max
      
      if (timeSinceFailure > delay) {
        try {
          await this.sendWebhookRequest(item.webhook, item.payload);
          processed.push(item);
          logger.info(`Retry queue item processed successfully: ${item.webhook.url}`);
        } catch (error) {
          item.attempts++;
          logger.error(`Retry queue item failed (attempt ${item.attempts}): ${item.webhook.url}`);
          
          if (item.attempts >= 5) {
            processed.push(item);
            logger.error(`Retry queue item abandoned after 5 attempts: ${item.webhook.url}`);
          }
        }
      }
    }

    // Remove processed items
    for (const item of processed) {
      const index = this.retryQueue.indexOf(item);
      if (index > -1) {
        this.retryQueue.splice(index, 1);
      }
    }
  }

  // Get webhook status
  getWebhookStatus(event) {
    const webhooks = this.webhookConfigs.get(event) || [];
    return webhooks.map(w => ({
      url: w.url,
      active: w.active,
      retries: w.retries,
      maxRetries: w.maxRetries,
    }));
  }

  // Disable a webhook
  disableWebhook(event, url) {
    const webhooks = this.webhookConfigs.get(event) || [];
    const webhook = webhooks.find(w => w.url === url);
    if (webhook) {
      webhook.active = false;
      logger.info(`Webhook disabled: ${url}`);
      return true;
    }
    return false;
  }

  // Enable a webhook
  enableWebhook(event, url) {
    const webhooks = this.webhookConfigs.get(event) || [];
    const webhook = webhooks.find(w => w.url === url);
    if (webhook) {
      webhook.active = true;
      logger.info(`Webhook enabled: ${url}`);
      return true;
    }
    return false;
  }
}

const webhookService = new WebhookService();

// Process retry queue every minute
setInterval(() => {
  webhookService.processRetryQueue();
}, 60000);

module.exports = { webhookService };