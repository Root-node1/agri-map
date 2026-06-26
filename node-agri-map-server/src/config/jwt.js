const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    algorithm: 'HS256',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
    algorithm: 'HS256',
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateAPIKey = () => {
  return `ak_${crypto.randomBytes(24).toString('hex')}`;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  generateAPIKey,
};