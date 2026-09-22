const express = require('express');
const router = express.Router();
const { webhookService } = require('../services/webhookService');
const logger = require('../utils/logger');


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
