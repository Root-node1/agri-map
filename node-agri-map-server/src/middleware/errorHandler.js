const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let error = err;
  logger.error({ message: error.message, stack: error.stack, path: req.path });
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    error = new ApiError(409, `${field} already exists`);
  }
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(e => e.message);
    error = new ApiError(400, "Validation error", errors);
  }
  if (error.name === "CastError") {
    error = new ApiError(400, "Invalid ID format");
  }
  
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const errors = error.errors || [];
  
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
  
  res.status(statusCode).json({ success: false, message, errors });
};

module.exports = errorHandler;
