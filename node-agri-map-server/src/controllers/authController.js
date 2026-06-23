const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { generateToken, generateRefreshToken, verifyToken } = require('../config/jwt');
const { cacheSet, cacheGet, cacheDelete } = require('../config/redis');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');

exports.register = async (req, res, next) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError(400, 'User already exists with this email or phone');
    }

    const user = new User({
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
    });
    await user.save();

    // Create wallet
    const wallet = new Wallet({
      userId: user._id,
      currency: 'USD',
    });
    await wallet.save();

    // Generate tokens
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Cache user data (optional)
    await cacheSet(`user:${user._id}`, {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    }, 3600);

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
      wallet: {
        id: wallet._id,
        walletId: wallet.walletId,
        balance: wallet.balance,
      },
      token,
      refreshToken,
    }, 'User registered successfully'));
  } catch (error) {
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

    if (!user.isActive) {
      throw new ApiError(403, 'Account is deactivated');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const wallet = await Wallet.findOne({ userId: user._id });

    // Generate tokens
    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Cache user data
    await cacheSet(`user:${user._id}`, {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    }, 3600);

    // Store refresh token in Redis
    await cacheSet(`refresh:${user._id}`, refreshToken, 2592000); // 30 days

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json(new ApiResponse(200, {
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
      wallet: wallet ? {
        id: wallet._id,
        walletId: wallet.walletId,
        balance: wallet.balance,
      } : null,
      token,
      refreshToken,
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token required');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    // Check if refresh token exists in Redis
    const storedToken = await cacheGet(`refresh:${decoded.id}`);
    if (!storedToken || storedToken !== refreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    // Generate new tokens
    const newToken = generateToken({ id: user._id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Update refresh token in Redis
    await cacheSet(`refresh:${user._id}`, newRefreshToken, 2592000);

    res.status(200).json(new ApiResponse(200, {
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Delete refresh token from Redis
    await cacheDelete(`refresh:${req.userId}`);
    
    logger.info(`User logged out: ${req.userId}`);
    
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    // Try to get from cache first
    let userData = await cacheGet(`user:${req.userId}`);
    
    if (!userData) {
      const user = await User.findById(req.userId).populate('cooperativeId', 'name cooperativeId');
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      userData = {
        id: user._id,
        userId: user.userId,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        cooperative: user.cooperativeId,
        settings: user.settings,
        lastLogin: user.lastLogin,
      };
      
      // Cache for future requests
      await cacheSet(`user:${req.userId}`, userData, 3600);
    }

    const wallet = await Wallet.findOne({ userId: req.userId });

    res.status(200).json(new ApiResponse(200, {
      user: userData,
      wallet: wallet ? {
        id: wallet._id,
        walletId: wallet.walletId,
        balance: wallet.balance,
        currency: wallet.currency,
      } : null,
    }, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};