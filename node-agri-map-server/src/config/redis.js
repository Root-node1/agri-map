const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;
let redisConnected = false;

const connectRedis = async () => {
  try {
    // Check if Redis is configured
    if (!process.env.REDIS_HOST) {
      logger.info('Redis not configured, skipping...');
      return null;
    }

    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      // Only log error once
      if (!redisConnected) {
        logger.warn('⚠️  Redis connection failed (optional service)');
        redisConnected = false;
      }
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
      redisConnected = true;
    });

    // Set a timeout for connection
    const timeout = setTimeout(() => {
      if (!redisConnected) {
        logger.warn('⚠️  Redis connection timeout (optional service)');
        redisClient.quit();
      }
    }, 5000);

    await redisClient.connect();
    clearTimeout(timeout);
    
    return redisClient;
  } catch (error) {
    logger.warn('⚠️  Redis not available (optional service)');
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient || !redisConnected) {
    return null;
  }
  return redisClient;
};

// Redis helper functions (safe - won't error if Redis is down)
const cacheSet = async (key, value, expiration = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.set(key, stringValue, { EX: expiration });
    return true;
  } catch (error) {
    return false;
  }
};

const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const value = await client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    return null;
  }
};

const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheSet,
  cacheGet,
  cacheDelete,
};
