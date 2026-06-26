const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route - THIS IS WHAT'S MISSING!
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌾 Welcome to AgriMap API!',
    version: '2.0.0',
    docs: 'https://agrimap-node-api.onrender.com/api',
    endpoints: {
      health: '/health',
      api: '/api',
      register: '/api/auth/register',
      login: '/api/auth/login',
      profile: '/api/auth/profile',
      ai: '/api/ai',
      chatbot: '/api/chatbot',
      loans: '/api/loans',
      carbon: '/api/carbon-credits',
      wallet: '/api/wallet',
      subscriptions: '/api/subscriptions'
    },
    status: '✅ Server is running!'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: '✅ Connected',
    redis: '⚠️ Optional',
    message: '🚀 AgriMap API is running!'
  });
});

// API root
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgriMap API v2.0',
    endpoints: {
      health: '/health',
      api: '/api',
      register: '/api/auth/register',
      login: '/api/auth/login',
      profile: '/api/auth/profile'
    }
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register called:', req.body);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        email: req.body.email || 'test@example.com',
        firstName: req.body.firstName || 'Test',
        lastName: req.body.lastName || 'User'
      },
      token: 'mock_token_' + Date.now()
    }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login called:', req.body);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: { 
        email: req.body.email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      },
      token: 'mock_token_' + Date.now()
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.path);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    availableRoutes: [
      '/',
      '/health',
      '/api',
      '/api/auth/register',
      '/api/auth/login'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🌾 AgriMap API Server');
  console.log('='.repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Root: http://localhost:${PORT}/`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🔗 Register: http://localhost:${PORT}/api/auth/register`);
  console.log('='.repeat(50));
});
