const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Subscription details
  plan: {
    type: String,
    enum: ['free', 'basic', 'professional', 'enterprise', 'ngo'],
    default: 'free'
  },
  tier: {
    type: String,
    enum: ['free', 'starter', 'growth', 'business', 'enterprise'],
    default: 'free'
  },
  
  // Pricing
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  
  // Billing
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual', 'lifetime'],
    default: 'monthly'
  },
  
  // Features
  features: {
    maxFarmers: { type: Number, default: 0 },
    maxFields: { type: Number, default: 0 },
    maxAIRequests: { type: Number, default: 0 },
    maxAPICalls: { type: Number, default: 0 },
    
    // Feature flags
    cropDetection: { type: Boolean, default: false },
    soilAnalysis: { type: Boolean, default: false },
    carbonTracking: { type: Boolean, default: false },
    yieldPrediction: { type: Boolean, default: false },
    satelliteImagery: { type: Boolean, default: false },
    chatbotAccess: { type: Boolean, default: false },
    blockchainIntegration: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    
    // Limits
    storageLimit: { type: Number, default: 100 }, // MB
    apiRateLimit: { type: Number, default: 100 }, // requests/minute
  },
  
  // API Keys
  apiKeys: [{
    key: { type: String, required: true },
    name: { type: String, default: 'Default' },
    permissions: [String],
    expiresAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date, default: null },
    usage: { type: Number, default: 0 }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'cancelled', 'pending'],
    default: 'pending'
  },
  
  // Dates
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null },
  trialEndDate: { type: Date, default: null },
  
  // Billing
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'mpesa', 'bank_transfer', 'crypto']
  },
  paymentId: { type: String, default: null },
  invoiceId: { type: String, default: null },
  
  // Metadata
  metadata: {
    organization: { type: String },
    industry: { type: String },
    teamSize: { type: Number },
    useCase: { type: String }
  },
  
  // Cancellation
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: null },
  
  // Usage tracking
  usage: {
    apiCalls: { type: Number, default: 0 },
    aiRequests: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Generate subscription ID
subscriptionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Set features based on plan
    const planFeatures = {
      free: {
        maxFarmers: 1,
        maxFields: 3,
        maxAIRequests: 10,
        maxAPICalls: 100,
        cropDetection: true,
        soilAnalysis: false,
        carbonTracking: false,
        yieldPrediction: false,
        satelliteImagery: false,
        chatbotAccess: false,
        blockchainIntegration: false,
        apiAccess: false,
        storageLimit: 10,
        apiRateLimit: 10
      },
      basic: {
        maxFarmers: 10,
        maxFields: 50,
        maxAIRequests: 100,
        maxAPICalls: 1000,
        cropDetection: true,
        soilAnalysis: true,
        carbonTracking: false,
        yieldPrediction: false,
        satelliteImagery: false,
        chatbotAccess: true,
        blockchainIntegration: false,
        apiAccess: false,
        storageLimit: 100,
        apiRateLimit: 50
      },
      professional: {
        maxFarmers: 100,
        maxFields: 500,
        maxAIRequests: 1000,
        maxAPICalls: 10000,
        cropDetection: true,
        soilAnalysis: true,
        carbonTracking: true,
        yieldPrediction: true,
        satelliteImagery: true,
        chatbotAccess: true,
        blockchainIntegration: false,
        apiAccess: true,
        storageLimit: 500,
        apiRateLimit: 100
      },
      enterprise: {
        maxFarmers: -1, // unlimited
        maxFields: -1, // unlimited
        maxAIRequests: -1, // unlimited
        maxAPICalls: -1, // unlimited
        cropDetection: true,
        soilAnalysis: true,
        carbonTracking: true,
        yieldPrediction: true,
        satelliteImagery: true,
        chatbotAccess: true,
        blockchainIntegration: true,
        apiAccess: true,
        storageLimit: 10000,
        apiRateLimit: 1000
      },
      ngo: {
        maxFarmers: 500,
        maxFields: 1000,
        maxAIRequests: 500,
        maxAPICalls: 5000,
        cropDetection: true,
        soilAnalysis: true,
        carbonTracking: true,
        yieldPrediction: true,
        satelliteImagery: true,
        chatbotAccess: true,
        blockchainIntegration: false,
        apiAccess: true,
        storageLimit: 1000,
        apiRateLimit: 200
      }
    };
    
    const features = planFeatures[this.plan] || planFeatures.free;
    this.features = { ...this.features, ...features };
    
    // Set expiry date
    if (this.billingCycle === 'monthly') {
      this.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (this.billingCycle === 'annual') {
      this.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
