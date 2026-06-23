const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Show configuration status
logger.info('=== Configuration Status ===');
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PORT: ${process.env.PORT}`);
logger.info(`MongoDB: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Missing'}`);
logger.info(`Redis: ${process.env.REDIS_HOST ? '✅ Configured' : '⚠️  Optional'}`);
logger.info(`JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
logger.info(`Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '⚠️  Optional'}`);
logger.info(`Blockchain: ${process.env.ETHEREUM_RPC_URL ? '✅ Configured' : '⚠️  Optional'}`);
logger.info('============================');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB connected successfully');

    // Connect to Redis (optional - won't crash if fails)
    try {
      logger.info('Connecting to Redis...');
      await connectRedis();
    } catch (error) {
      // Redis is optional, just log and continue
      logger.info('ℹ️  Redis is optional, continuing without it');
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
      logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🤖 AI Service: http://localhost:${PORT}/api/ai`);
      logger.info('✅ Server is ready to accept requests');
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server...');
      server.close(async () => {
        logger.info('Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
