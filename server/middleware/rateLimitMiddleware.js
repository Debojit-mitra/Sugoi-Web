const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const Redis = require("ioredis");
const { AppError } = require("../utils/errorHandler");
const logger = require("../config/logger");

// Initialize Redis client if REDIS_URL is provided
let redisClient;
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info("Redis client connected for rate limiting");
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
  }
}

/**
 * Create a rate limiter with custom options
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Express middleware function
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 200, // Limit each IP to 200 requests per window
  message = "Too many requests, please try again later",
  keyPrefix = "ratelimit",
} = {}) => {
  const limiterOptions = {
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      next(new AppError(message, 429));
    },
  };

  // Use Redis store if Redis client is available
  if (redisClient) {
    limiterOptions.store = new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
      prefix: keyPrefix,
    });
  }

  return rateLimit(limiterOptions);
};

// Default API rate limiter
const apiLimiter = createRateLimiter();

// Stricter auth rate limiter
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: "Too many authentication attempts, please try again after an hour",
  keyPrefix: "authlimit",
});

// Search rate limiter
const searchLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 30 requests per 5 minutes
  message: "Too many search requests, please try again later",
  keyPrefix: "searchlimit",
});

// Scraping limiter (more restrictive)
const scrapingLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 50 requests per 10 minutes
  message: "Too many scraping requests, please try again later",
  keyPrefix: "scrapelimit",
});

module.exports = {
  apiLimiter,
  authLimiter,
  searchLimiter,
  scrapingLimiter,
  createRateLimiter,
};
