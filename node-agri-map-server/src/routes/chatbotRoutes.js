const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');
const { authMiddleware } = require('../middleware/auth');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// Send message to chatbot
router.post('/message', authMiddleware, async (req, res, next) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const result = await chatbotService.processMessage(
      req.userId,
      message,
      context || {}
    );

    res.status(200).json(new ApiResponse(200, {
      response: result.response,
      intent: result.intent,
      confidence: result.confidence,
      history: result.history.slice(-5) // Last 5 messages
    }, 'Message processed successfully'));
  } catch (error) {
    next(error);
  }
});

// Get conversation history
router.get('/history', authMiddleware, async (req, res, next) => {
  try {
    const history = chatbotService.getHistory(req.userId);
    
    res.status(200).json(new ApiResponse(200, {
      history,
      total: history.length
    }, 'History retrieved successfully'));
  } catch (error) {
    next(error);
  }
});

// Clear conversation history
router.delete('/history', authMiddleware, async (req, res, next) => {
  try {
    const result = chatbotService.clearHistory(req.userId);
    
    res.status(200).json(new ApiResponse(200, {
      cleared: result
    }, 'History cleared successfully'));
  } catch (error) {
    next(error);
  }
});

// Get conversation analytics
router.get('/analytics', authMiddleware, async (req, res, next) => {
  try {
    const analytics = chatbotService.getAnalytics(req.userId);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No conversation data found'
      });
    }

    res.status(200).json(new ApiResponse(200, analytics, 'Analytics retrieved successfully'));
  } catch (error) {
    next(error);
  }
});

// Get farm recommendations
router.post('/recommendations', authMiddleware, async (req, res, next) => {
  try {
    const { farmData } = req.body;
    
    if (!farmData) {
      return res.status(400).json({
        success: false,
        message: 'Farm data is required'
      });
    }

    const recommendations = await chatbotService.getFarmRecommendation(
      req.userId,
      farmData
    );

    res.status(200).json(new ApiResponse(200, {
      recommendations,
      total: recommendations.length
    }, 'Recommendations generated successfully'));
  } catch (error) {
    next(error);
  }
});

// Webhook for chat messages (for external integration)
router.post('/webhook', async (req, res, next) => {
  try {
    const { userId, message, context } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID and message are required'
      });
    }

    const result = await chatbotService.processMessage(
      userId,
      message,
      context || {}
    );

    res.status(200).json({
      success: true,
      response: result.response,
      intent: result.intent,
      confidence: result.confidence
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
