const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const loanRoutes = require('./loanRoutes');
const carbonCreditRoutes = require('./carbonCreditRoutes');
const walletRoutes = require('./walletRoutes');
const paymentRoutes = require('./paymentRoutes');
const webhookRoutes = require('./webhookRoutes');
const aiRoutes = require('./aiRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// Mount all routes
router.use('/auth', authRoutes);
router.use('/loans', loanRoutes);
router.use('/carbon-credits', carbonCreditRoutes);
router.use('/wallet', walletRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/ai', aiRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/subscriptions', subscriptionRoutes);

// Root API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AgriMap API v2.0',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      loans: '/api/loans',
      carbonCredits: '/api/carbon-credits',
      wallet: '/api/wallet',
      payments: '/api/payments',
      ai: '/api/ai',
      chatbot: '/api/chatbot',
      subscriptions: '/api/subscriptions',
      webhooks: '/api/webhooks'
    }
  });
});

module.exports = router;
