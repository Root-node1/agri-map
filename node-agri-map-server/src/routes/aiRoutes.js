const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { authMiddleware } = require('../middleware/auth');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// ============ CROP DETECTION ============

router.post('/detect-crop', authMiddleware, async (req, res, next) => {
  try {
    const { imageData, options } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    const result = await aiService.detectCrop(imageData, options);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Crop detection completed'));
  } catch (error) {
    next(error);
  }
});

// ============ SOIL ANALYSIS ============

router.post('/analyze-soil', authMiddleware, async (req, res, next) => {
  try {
    const { soilData, options } = req.body;
    
    if (!soilData) {
      return res.status(400).json({
        success: false,
        message: 'Soil data is required'
      });
    }

    const result = await aiService.analyzeSoil(soilData, options);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Soil analysis completed'));
  } catch (error) {
    next(error);
  }
});

// ============ CARBON SEQUESTRATION ============

router.post('/predict-carbon', authMiddleware, async (req, res, next) => {
  try {
    const data = req.body;
    
    if (!data.fieldId && !data.area) {
      return res.status(400).json({
        success: false,
        message: 'Field ID or area is required'
      });
    }

    const result = await aiService.predictCarbonSequestration(data);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Carbon sequestration prediction completed'));
  } catch (error) {
    next(error);
  }
});

// ============ YIELD PREDICTION ============

router.post('/predict-yield', authMiddleware, async (req, res, next) => {
  try {
    const data = req.body;
    
    if (!data.fieldId && !data.area) {
      return res.status(400).json({
        success: false,
        message: 'Field ID or area is required'
      });
    }

    const result = await aiService.predictYield(data);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Yield prediction completed'));
  } catch (error) {
    next(error);
  }
});

// ============ VEGETATION HEALTH ============

router.post('/analyze-vegetation', authMiddleware, async (req, res, next) => {
  try {
    const { vegetationData, options } = req.body;
    
    if (!vegetationData) {
      return res.status(400).json({
        success: false,
        message: 'Vegetation data is required'
      });
    }

    const result = await aiService.analyzeVegetationHealth(vegetationData, options);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Vegetation health analysis completed'));
  } catch (error) {
    next(error);
  }
});

// ============ COMPREHENSIVE FIELD ANALYSIS ============

router.post('/analyze-field', authMiddleware, async (req, res, next) => {
  try {
    const fieldData = req.body;
    
    if (!fieldData.fieldId) {
      return res.status(400).json({
        success: false,
        message: 'Field ID is required'
      });
    }

    const result = await aiService.analyzeField(fieldData);
    
    res.status(200).json(new ApiResponse(200, {
      ...result,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Field analysis completed'));
  } catch (error) {
    next(error);
  }
});

// ============ BATCH ANALYSIS ============

router.post('/batch-analyze', authMiddleware, async (req, res, next) => {
  try {
    const { fields } = req.body;
    
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({
        success: false,
        message: 'Fields array is required'
      });
    }

    const results = [];
    for (const field of fields) {
      try {
        const result = await aiService.analyzeField(field);
        results.push(result);
      } catch (error) {
        logger.error(`Batch analysis error for field ${field.fieldId}:`, error);
        results.push({
          fieldId: field.fieldId,
          error: 'Analysis failed',
          isFallback: true
        });
      }
    }

    res.status(200).json(new ApiResponse(200, {
      results,
      total: results.length,
      successful: results.filter(r => !r.isFallback).length,
      userId: req.userId,
      requestId: `req_${Date.now()}`
    }, 'Batch analysis completed'));
  } catch (error) {
    next(error);
  }
});

// ============ MODEL INFO ============

router.get('/models', authMiddleware, async (req, res, next) => {
  try {
    const modelInfo = {
      cropDetection: {
        version: '1.0.0',
        status: 'active',
        accuracy: '92.5%',
        lastUpdated: '2026-06-01'
      },
      soilAnalysis: {
        version: '1.0.0',
        status: 'active',
        accuracy: '88.3%',
        lastUpdated: '2026-06-01'
      },
      carbonSequestration: {
        version: '1.0.0',
        status: 'active',
        accuracy: '85.7%',
        lastUpdated: '2026-06-01'
      },
      yieldPrediction: {
        version: '1.0.0',
        status: 'active',
        accuracy: '87.9%',
        lastUpdated: '2026-06-01'
      },
      vegetationHealth: {
        version: '1.0.0',
        status: 'active',
        accuracy: '90.1%',
        lastUpdated: '2026-06-01'
      }
    };

    res.status(200).json(new ApiResponse(200, modelInfo, 'Model information retrieved'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
