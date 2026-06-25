const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Subscription = require('../models/Subscription');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { verifyFirebaseToken } = require('../config/firebase');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

// Register with Firebase
exports.firebaseRegister = async (req, res, next) => {
  try {
    const { firebaseToken, role = 'farmer', ...userData } = req.body;
    
    // Verify Firebase token
    const decoded = await verifyFirebaseToken(firebaseToken);
    
    // Check if user exists
    let user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      user = new User({
        userId: `usr_${Date.now()}`,
        email: decoded.email,
        phone: userData.phone || decoded.phone || '',
        password: Math.random().toString(36).substr(2, 10),
        firstName: userData.firstName || decoded.name || '',
        lastName: userData.lastName || '',
        role: role,
        firebaseUid: decoded.uid,
        isVerified: true,
        provider: 'firebase'
      });
      await user.save();
      
      // Create wallet
      const wallet = new Wallet({
        userId: user._id,
        currency: 'USD',
      });
      await wallet.save();
      
      // Create free subscription
      const subscription = new Subscription({
        userId: user._id,
        plan: 'free',
        billingCycle: 'monthly',
        price: 0,
        currency: 'USD',
        status: 'active'
      });
      await subscription.save();
    }
    
    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    logger.info(`User registered with Firebase: ${user.email}`);
    
    res.status(201).json(new ApiResponse(201, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider
      },
      token,
      refreshToken
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

// Login with Firebase
exports.firebaseLogin = async (req, res, next) => {
  try {
    const { firebaseToken } = req.body;
    
    // Verify Firebase token
    const decoded = await verifyFirebaseToken(firebaseToken);
    
    // Find user
    let user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      // Auto-register if user doesn't exist
      user = new User({
        userId: `usr_${Date.now()}`,
        email: decoded.email,
        phone: decoded.phone || '',
        password: Math.random().toString(36).substr(2, 10),
        firstName: decoded.name || '',
        lastName: '',
        role: 'farmer',
        firebaseUid: decoded.uid,
        isVerified: true,
        provider: 'firebase'
      });
      await user.save();
      
      const wallet = new Wallet({ userId: user._id });
      await wallet.save();
      
      const subscription = new Subscription({
        userId: user._id,
        plan: 'free',
        billingCycle: 'monthly',
        price: 0,
        currency: 'USD',
        status: 'active'
      });
      await subscription.save();
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    logger.info(`User logged in with Firebase: ${user.email}`);
    
    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider
      },
      token,
      refreshToken
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

// Traditional email/password register (backward compatibility)
exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }
    
    const user = new User({
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
      provider: 'email',
    });
    await user.save();
    
    const wallet = new Wallet({ userId: user._id });
    await wallet.save();
    
    const subscription = new Subscription({
      userId: user._id,
      plan: 'free',
      billingCycle: 'monthly',
      price: 0,
      currency: 'USD',
      status: 'active'
    });
    await subscription.save();
    
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    logger.info(`User registered: ${user.email}`);
    
    res.status(201).json(new ApiResponse(201, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        provider: user.provider
      },
      wallet: { id: wallet._id, walletId: wallet.walletId, balance: wallet.balance },
      token,
      refreshToken
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

// Traditional login (backward compatibility)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, provider: 'email' });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const wallet = await Wallet.findOne({ userId: user._id });
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    logger.info(`User logged in: ${user.email}`);
    
    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      wallet: wallet ? { id: wallet._id, walletId: wallet.walletId, balance: wallet.balance } : null,
      token,
      refreshToken
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

// Existing getProfile, refreshToken, logout remain the same...
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('cooperativeId', 'name cooperativeId');
    if (!user) throw new ApiError(404, 'User not found');
    
    const wallet = await Wallet.findOne({ userId: user._id });
    const subscription = await Subscription.findOne({ userId: user._id, status: 'active' });
    
    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        provider: user.provider,
        cooperative: user.cooperativeId
      },
      wallet: wallet ? { id: wallet._id, walletId: wallet.walletId, balance: wallet.balance } : null,
      subscription: subscription ? {
        plan: subscription.plan,
        tier: subscription.tier,
        status: subscription.status,
        expiryDate: subscription.expiryDate
      } : null
    }, 'Profile retrieved'));
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, 'Refresh token required');
    
    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'User not found');
    
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });
    
    res.status(200).json(new ApiResponse(200, {
      token,
      refreshToken: newRefreshToken
    }, 'Token refreshed'));
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};
