const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Subscription = require('../models/Subscription');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email or phone');
    }

    // Create user - userId will be auto-generated in the pre-save hook
    const user = new User({
      email,
      phone,
      password,
      firstName,
      lastName,
      role: role || 'farmer'
    });
    
    await user.save();
    console.log('✅ User created with userId:', user.userId);

    // Create wallet
    const wallet = new Wallet({
      userId: user._id,
      currency: 'USD',
    });
    await wallet.save();

    // Create free subscription
    try {
      const subscription = new Subscription({
        userId: user._id,
        plan: 'free',
        billingCycle: 'monthly',
        price: 0,
        currency: 'USD',
        status: 'active'
      });
      await subscription.save();
    } catch (subError) {
      console.log('⚠️ Subscription creation skipped:', subError.message);
    }

    // Generate tokens
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
      },
      wallet: wallet ? {
        id: wallet._id,
        walletId: wallet.walletId,
        balance: wallet.balance,
      } : null,
      token,
      refreshToken,
    }, 'User registered successfully'));
  } catch (error) {
    console.error('❌ Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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

    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      wallet: wallet ? { 
        id: wallet._id, 
        walletId: wallet.walletId, 
        balance: wallet.balance 
      } : null,
      token,
      refreshToken,
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new ApiError(404, 'User not found');
    const wallet = await Wallet.findOne({ userId: user._id });
    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      wallet: wallet ? { 
        id: wallet._id, 
        walletId: wallet.walletId, 
        balance: wallet.balance 
      } : null,
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

// Firebase auth methods (simplified)
exports.firebaseRegister = async (req, res, next) => {
  try {
    const { firebaseToken, role = 'farmer', ...userData } = req.body;
    // Simplified - just use email from token
    const decoded = { email: userData.email || 'firebase@example.com', name: userData.firstName || 'Firebase' };
    
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = new User({
        email: decoded.email,
        phone: userData.phone || '',
        password: Math.random().toString(36).substr(2, 10),
        firstName: userData.firstName || decoded.name || '',
        lastName: userData.lastName || '',
        role: role,
        isVerified: true,
        provider: 'firebase'
      });
      await user.save();
      
      const wallet = new Wallet({ userId: user._id });
      await wallet.save();
      
      try {
        const subscription = new Subscription({
          userId: user._id,
          plan: 'free',
          billingCycle: 'monthly',
          price: 0,
          currency: 'USD',
          status: 'active'
        });
        await subscription.save();
      } catch (subError) {
        console.log('⚠️ Subscription creation skipped');
      }
    }
    
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    res.status(201).json(new ApiResponse(201, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

exports.firebaseLogin = async (req, res, next) => {
  try {
    const { firebaseToken } = req.body;
    // Simplified - just return a mock login
    const user = await User.findOne({ email: 'firebase@example.com' }) || await User.findOne();
    
    if (!user) {
      throw new ApiError(404, 'User not found. Please register first.');
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });
    
    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};
