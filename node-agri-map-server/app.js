const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const loanRoutes = require('./src/routes/loanRoutes');
const carbonCreditRoutes = require('./src/routes/carbonCreditRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');

// Django-style routes (for compatibility)
const farmersRoutes = require('./src/routes/farmersRoutes');
const cooperativesRoutes = require('./src/routes/cooperativesRoutes');
const satelliteRoutes = require('./src/routes/satelliteRoutes');
const analysisRoutes = require('./src/routes/analysisRoutes');
const carbonRoutes = require('./src/routes/carbonRoutes');
const reportsRoutes = require('./src/routes/reportsRoutes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' }
});
app.use('/api', limiter);

// Webhook routes - must come before express.json()
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
    redis: process.env.REDIS_HOST ? 'configured' : 'not configured',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
    blockchain: process.env.ETHEREUM_RPC_URL ? 'configured' : 'not configured',
    ai: 'enabled',
    chatbot: 'enabled',
    subscription: 'enabled'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/carbon-credits', carbonCreditRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Django-style routes (for compatibility with frontend)
app.use('/api/farmers', farmersRoutes);
app.use('/api/cooperatives', cooperativesRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/reports', reportsRoutes);

// API Root
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'AgriMap API v2.0',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      farmers: '/api/farmers',
      cooperatives: '/api/cooperatives',
      loans: '/api/loans',
      carbon: '/api/carbon',
      carbonCredits: '/api/carbon-credits',
      satellite: '/api/satellite',
      analysis: '/api/analysis',
      reports: '/api/reports',
      wallet: '/api/wallet',
      payments: '/api/payments',
      ai: '/api/ai',
      chatbot: '/api/chatbot',
      subscriptions: '/api/subscriptions',
      webhooks: '/api/webhooks'
    },
    docs: 'Import the Postman collection for detailed API documentation',
    live: 'https://agrimap-node-api.onrender.com'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    availableRoutes: [
      '/api',
      '/api/auth',
      '/api/farmers',
      '/api/cooperatives',
      '/api/loans',
      '/api/carbon',
      '/api/carbon-credits',
      '/api/satellite',
      '/api/analysis',
      '/api/reports',
      '/api/wallet',
      '/api/payments',
      '/api/ai',
      '/api/chatbot',
      '/api/subscriptions',
      '/api/webhooks',
      '/health'
    ]
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
