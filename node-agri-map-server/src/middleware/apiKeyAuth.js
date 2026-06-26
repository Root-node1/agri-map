const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// API Key Authentication middleware
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      throw new ApiError(401, 'API key required');
    }
    
    // Find subscription with this API key
    const subscription = await Subscription.findOne({
      'apiKeys.key': apiKey,
      status: 'active'
    }).populate('userId');
    
    if (!subscription) {
      throw new ApiError(401, 'Invalid API key');
    }
    
    // Check if API key is expired
    const apiKeyData = subscription.apiKeys.find(k => k.key === apiKey);
    if (apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < new Date()) {
      throw new ApiError(401, 'API key expired');
    }
    
    // Update last used
    apiKeyData.lastUsed = new Date();
    apiKeyData.usage += 1;
    subscription.usage.apiCalls += 1;
    await subscription.save();
    
    // Attach to request
    req.userId = subscription.userId._id;
    req.user = subscription.userId;
    req.subscription = subscription;
    req.apiKey = apiKey;
    
    // Check rate limit
    const rateLimit = subscription.features.apiRateLimit || 100;
    const recentCalls = await getRecentCalls(apiKey);
    if (recentCalls >= rateLimit) {
      throw new ApiError(429, 'Rate limit exceeded');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Track API calls for rate limiting
const recentCalls = new Map();

async function getRecentCalls(apiKey) {
  const now = Date.now();
  const calls = recentCalls.get(apiKey) || [];
  const recent = calls.filter(time => now - time < 60000); // Last 60 seconds
  recentCalls.set(apiKey, recent);
  return recent.length;
}

// Record API call
function recordApiCall(apiKey) {
  const calls = recentCalls.get(apiKey) || [];
  calls.push(Date.now());
  recentCalls.set(apiKey, calls);
}

// Middleware to check subscription limits
const checkSubscriptionLimits = (resource) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription;
      if (!subscription) {
        throw new ApiError(403, 'No active subscription');
      }
      
      // Check resource limits
      const limits = {
        farmers: subscription.features.maxFarmers,
        fields: subscription.features.maxFields,
        aiRequests: subscription.features.maxAIRequests,
        apiCalls: subscription.features.maxAPICalls,
        storage: subscription.features.storageLimit
      };
      
      // If unlimited (-1), skip check
      if (limits[resource] === -1) {
        return next();
      }
      
      // Check usage
      const usage = subscription.usage[resource] || 0;
      if (usage >= limits[resource]) {
        throw new ApiError(429, `${resource} limit exceeded`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { apiKeyAuth, checkSubscriptionLimits, recordApiCall };
