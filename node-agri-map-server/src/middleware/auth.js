const { verifyToken } = require("../config/jwt");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "User not found");
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
