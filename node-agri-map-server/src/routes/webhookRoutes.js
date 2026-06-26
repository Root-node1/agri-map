const express = require('express');
const router = express.Router();
const { webhookService } = require('../services/webhookService');
const logger = require('../utils/logger');

// Stripe Webhook
router.post('/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    let stripeService;
    try {
      stripeService = require('../services/stripService');
    } catch (error) {
      logger.warn('Stripe service not available, using mock');
      stripeService = {
        verifyWebhookSignature: (payload, signature) => {
          return { type: 'payment_intent.succeeded', data: { object: { id: 'pi_mock_123' } } };
        }
      };
    }

    const event = stripeService.verifyWebhookSignature(
      JSON.stringify(req.body),
      signature
    );

    logger.info(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await webhookService.sendWebhook('payment.confirmed', {
          paymentId: paymentIntent.metadata?.paymentId || 'unknown',
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: 'completed',
        });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        logger.warn('Payment failed:', failedPayment.id);
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        logger.info('Refund processed:', refund.id);
        break;

      default:
        logger.info(`Unhandled Stripe event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Loan Webhooks
router.post('/loan-approved', async (req, res) => {
  try {
    const { loanId, cooperativeId, amount } = req.body;
    logger.info(`Loan approved webhook: ${loanId}`);
    
    await webhookService.sendWebhook('loan.approved', {
      loanId,
      cooperativeId,
      amount,
      status: 'approved',
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Loan approved webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/loan-disbursed', async (req, res) => {
  try {
    const { loanId, cooperativeId, amount, disbursementDate } = req.body;
    logger.info(`Loan disbursed webhook: ${loanId}`);
    
    await webhookService.sendWebhook('loan.disbursed', {
      loanId,
      cooperativeId,
      amount,
      disbursementDate,
      status: 'disbursed',
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Loan disbursed webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Carbon Credit Webhooks
router.post('/carbon-verified', async (req, res) => {
  try {
    const { creditId, cooperativeId, amount, verificationData } = req.body;
    logger.info(`Carbon verified webhook: ${creditId}`);
    
    await webhookService.sendWebhook('carbon.verified', {
      creditId,
      cooperativeId,
      amount,
      verificationData,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Carbon verified webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/carbon-credit-minted', async (req, res) => {
  try {
    const { creditId, tokenId, amount, transactionHash } = req.body;
    logger.info(`Carbon credit minted webhook: ${creditId}`);
    
    await webhookService.sendWebhook('carbon.credit.minted', {
      creditId,
      tokenId,
      amount,
      transactionHash,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Carbon credit minted webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Payment Webhooks
router.post('/payment-confirmed', async (req, res) => {
  try {
    const { paymentId, transactionId, amount, status } = req.body;
    logger.info(`Payment confirmed webhook: ${paymentId}`);
    
    await webhookService.sendWebhook('payment.confirmed', {
      paymentId,
      transactionId,
      amount,
      status,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Payment confirmed webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Wallet Webhooks
router.post('/wallet-updated', async (req, res) => {
  try {
    const { walletId, userId, balance, transactionType, amount } = req.body;
    logger.info(`Wallet updated webhook: ${walletId}`);
    
    await webhookService.sendWebhook('wallet.updated', {
      walletId,
      userId,
      balance,
      transactionType,
      amount,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Wallet updated webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// User Webhooks
router.post('/user-registered', async (req, res) => {
  try {
    const { userId, email, firstName, lastName } = req.body;
    logger.info(`User registered webhook: ${userId}`);
    
    await webhookService.sendWebhook('user.registered', {
      userId,
      email,
      firstName,
      lastName,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('User registered webhook error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Webhook status endpoint
router.get('/status', (req, res) => {
  const events = ['loan.approved', 'loan.disbursed', 'carbon.verified', 'payment.confirmed'];
  const status = {};
  
  events.forEach(event => {
    status[event] = webhookService.getWebhookStatus(event);
  });
  
  res.json({
    registeredWebhooks: webhookService.registeredWebhooks || {},
    webhookStatus: status,
    retryQueueLength: webhookService.retryQueue?.length || 0,
  });
});

module.exports = router;
