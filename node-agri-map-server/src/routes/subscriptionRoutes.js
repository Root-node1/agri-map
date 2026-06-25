const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Protected routes
router.post('/create', authMiddleware, subscriptionController.createSubscription);
router.get('/my-subscription', authMiddleware, subscriptionController.getSubscription);
router.post('/generate-api-key', authMiddleware, subscriptionController.generateApiKey);
router.get('/api-keys', authMiddleware, subscriptionController.listApiKeys);
router.delete('/api-keys/:keyId', authMiddleware, subscriptionController.revokeApiKey);
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.get('/usage', authMiddleware, subscriptionController.getUsageStats);

module.exports = router;
