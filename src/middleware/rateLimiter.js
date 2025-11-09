const rateLimit = require('express-rate-limit');

// Auth endpoints: 5 requests per IP per 15 minutes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints: 3 requests per user per day (handled in controller with user quota)
// This is a backup rate limiter per IP
const aiRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // Allow some buffer for multiple users from same IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authRateLimiter,
  aiRateLimiter,
};
