const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/env', (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
      REDIS_HOST: process.env.REDIS_HOST || 'Not configured',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing',
      ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL ? '✅ Configured' : '❌ Missing',
    }
  });
});

router.get('/db-status', async (req, res) => {
  const status = {
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    mongooseState: mongoose.connection.readyState,
    states: ['disconnected', 'connected', 'connecting', 'disconnecting']
  };
  res.json({ success: true, status });
});

module.exports = router;
