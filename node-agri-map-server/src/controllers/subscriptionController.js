const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { generateAPIKey } = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// Get available plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          maxFarmers: 1,
          maxFields: 3,
          maxAIRequests: 10,
          cropDetection: true,
          soilAnalysis: false,
          carbonTracking: false,
          chatbotAccess: false
        }
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 29,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          maxFarmers: 10,
          maxFields: 50,
          maxAIRequests: 100,
          cropDetection: true,
          soilAnalysis: true,
          carbonTracking: false,
          chatbotAccess: true
        }
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          maxFarmers: 100,
          maxFields: 500,
          maxAIRequests: 1000,
          cropDetection: true,
          soilAnalysis: true,
          carbonTracking: true,
          yieldPrediction: true,
          satelliteImagery: true,
          chatbotAccess: true,
          apiAccess: true
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          maxFarmers: -1,
          maxFields: -1,
          maxAIRequests: -1,
          cropDetection: true,
          soilAnalysis: true,
          carbonTracking: true,
          yieldPrediction: true,
          satelliteImagery: true,
          chatbotAccess: true,
          blockchainIntegration: true,
          apiAccess: true
        }
      },
      {
        id: 'ngo',
        name: 'NGO Discount',
        price: 29,
        currency: 'USD',
        billingCycle: 'monthly',
        features: {
          maxFarmers: 500,
          maxFields: 1000,
          maxAIRequests: 500,
          cropDetection: true,
          soilAnalysis: true,
          carbonTracking: true,
          yieldPrediction: true,
          satelliteImagery: true,
          chatbotAccess: true,
          apiAccess: true
        }
      }
    ];
    
    res.status(200).json(new ApiResponse(200, plans, 'Plans retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Create subscription
exports.createSubscription = async (req, res, next) => {
  try {
    const { 
      plan, 
      billingCycle = 'monthly',
      paymentMethod,
      metadata
    } = req.body;
    
    // Check if user already has subscription
    const existing = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (existing) {
      throw new ApiError(400, 'User already has an active subscription');
    }
    
    // Pricing
    const pricing = {
      free: { monthly: 0, annual: 0 },
      basic: { monthly: 29, annual: 290 },
      professional: { monthly: 99, annual: 990 },
      enterprise: { monthly: 499, annual: 4990 },
      ngo: { monthly: 29, annual: 290 }
    };
    
    const price = pricing[plan][billingCycle] || 0;
    
    // Create subscription
    const subscription = new Subscription({
      userId: req.userId,
      plan,
      billingCycle,
      price,
      currency: 'USD',
      paymentMethod,
      metadata,
      status: price === 0 ? 'active' : 'pending'
    });
    
    await subscription.save();
    
    // Generate API key if plan includes API access
    if (subscription.features.apiAccess) {
      const apiKey = generateAPIKey();
      subscription.apiKeys.push({
        key: apiKey,
        name: 'Default API Key',
        permissions: ['read', 'write'],
        createdAt: new Date()
      });
      await subscription.save();
    }
    
    logger.info(`Subscription created: ${subscription.subscriptionId} for user ${req.userId}`);
    
    res.status(201).json(new ApiResponse(201, {
      subscription,
      apiKey: subscription.apiKeys[0]?.key
    }, 'Subscription created successfully'));
  } catch (error) {
    next(error);
  }
};

// Get subscription details
exports.getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    }).populate('userId', 'email firstName lastName');
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    res.status(200).json(new ApiResponse(200, subscription, 'Subscription retrieved'));
  } catch (error) {
    next(error);
  }
};

// Generate API key
exports.generateApiKey = async (req, res, next) => {
  try {
    const { name, permissions = ['read'] } = req.body;
    
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    if (!subscription.features.apiAccess) {
      throw new ApiError(403, 'API access not included in current plan');
    }
    
    const apiKey = generateAPIKey();
    subscription.apiKeys.push({
      key: apiKey,
      name: name || `API Key ${subscription.apiKeys.length + 1}`,
      permissions,
      createdAt: new Date()
    });
    
    await subscription.save();
    
    res.status(201).json(new ApiResponse(201, {
      apiKey,
      name: name || `API Key ${subscription.apiKeys.length}`,
      permissions
    }, 'API key generated'));
  } catch (error) {
    next(error);
  }
};

// List API keys
exports.listApiKeys = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    const keys = subscription.apiKeys.map(k => ({
      key: k.key,
      name: k.name,
      permissions: k.permissions,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
      usage: k.usage,
      expiresAt: k.expiresAt
    }));
    
    res.status(200).json(new ApiResponse(200, keys, 'API keys retrieved'));
  } catch (error) {
    next(error);
  }
};

// Revoke API key
exports.revokeApiKey = async (req, res, next) => {
  try {
    const { keyId } = req.params;
    
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    const index = subscription.apiKeys.findIndex(k => k.key === keyId);
    if (index === -1) {
      throw new ApiError(404, 'API key not found');
    }
    
    subscription.apiKeys.splice(index, 1);
    await subscription.save();
    
    res.status(200).json(new ApiResponse(200, null, 'API key revoked'));
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    await subscription.save();
    
    res.status(200).json(new ApiResponse(200, null, 'Subscription cancelled'));
  } catch (error) {
    next(error);
  }
};

// Get usage stats
exports.getUsageStats = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'active'
    });
    
    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }
    
    res.status(200).json(new ApiResponse(200, {
      usage: subscription.usage,
      features: subscription.features,
      limits: {
        farmers: subscription.features.maxFarmers,
        fields: subscription.features.maxFields,
        aiRequests: subscription.features.maxAIRequests,
        apiCalls: subscription.features.maxAPICalls,
        storage: subscription.features.storageLimit
      },
      apiKeys: subscription.apiKeys.length
    }, 'Usage stats retrieved'));
  } catch (error) {
    next(error);
  }
};
