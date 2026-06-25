const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Register cooperative
router.post('/register', async (req, res) => {
  res.json({ success: true, message: 'Cooperative registered', data: req.body });
});

// Get all cooperatives
router.get('/', authMiddleware, (req, res) => {
  res.json({ success: true, cooperatives: [], count: 0 });
});

// Get cooperative by ID
router.get('/:id', authMiddleware, (req, res) => {
  res.json({ success: true, cooperative: { id: req.params.id, name: 'Cooperative' } });
});

module.exports = router;
