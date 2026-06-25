const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get vegetation indices (NDVI/EVI)
router.get('/vegetation/:field_id', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    ndvi: 0.65, 
    evi: 0.55,
    fieldId: req.params.field_id,
    timestamp: new Date().toISOString()
  });
});

// Get crop type
router.get('/crop-type/:field_id', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    cropType: 'maize', 
    confidence: 0.92,
    fieldId: req.params.field_id
  });
});

// Get soil health
router.get('/soil/:field_id', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    nitrogen_proxy: 0.62, 
    moisture_index: 0.48,
    degradation_risk: 'moderate',
    fieldId: req.params.field_id
  });
});

// Get degradation
router.get('/degradation/:field_id', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    risk: 'moderate', 
    index: 0.45,
    fieldId: req.params.field_id
  });
});

// Get trends
router.get('/trends/:field_id', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    ndviHistory: [0.45, 0.52, 0.61, 0.65, 0.62],
    dates: ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01'],
    fieldId: req.params.field_id
  });
});

module.exports = router;
