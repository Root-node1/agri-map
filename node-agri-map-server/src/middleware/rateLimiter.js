const rateLimit = require("express-rate-limit");

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message: message || "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = { createRateLimiter };
