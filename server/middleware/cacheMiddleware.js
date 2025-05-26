const NodeCache = require("node-cache");
const logger = require("../config/logger");

// Initialize cache with default TTL of 10 minutes and check period of 60 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

/**
 * Get cache key from request
 * @param {Object} req - Express request object
 * @returns {String} - Cache key
 */
const getCacheKey = (req) => {
  const path = req.originalUrl || req.url;
  return `${req.method}:${path}`;
};

/**
 * Middleware to cache responses
 * @param {Number} duration - Cache duration in seconds
 * @returns {Function} - Express middleware function
 */
const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests, authenticated endpoints, or if cache is disabled
    if (
      req.method !== "GET" ||
      req.headers.authorization ||
      process.env.DISABLE_CACHE === "true"
    ) {
      return next();
    }

    const key = getCacheKey(req);
    const cachedData = cache.get(key);

    if (cachedData) {
      logger.debug(`Cache hit for ${key}`);
      return res.status(200).json(cachedData);
    }

    // Store original send function
    const originalSend = res.send;

    // Override send
    res.send = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        try {
          const parsedBody = JSON.parse(body);
          cache.set(key, parsedBody, duration);
          logger.debug(`Cached response for ${key} (${duration}s)`);
        } catch (error) {
          logger.error(`Error caching response: ${error.message}`);
        }
      }

      // Call original send
      originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Clear cache by pattern
 * @param {String} pattern - Pattern to match keys
 */
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => key.includes(pattern));

  if (matchingKeys.length > 0) {
    cache.del(matchingKeys);
    logger.debug(
      `Cleared ${matchingKeys.length} cache entries matching "${pattern}"`
    );
  }
};

/**
 * Clear entire cache
 */
const clearAllCache = () => {
  const keysCount = cache.keys().length;
  cache.flushAll();
  logger.debug(`Cleared all cache (${keysCount} entries)`);
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
const getCacheStats = () => {
  const keys = cache.keys();
  const stats = cache.getStats();

  return {
    keys: keys.length,
    hits: stats.hits,
    misses: stats.misses,
    ksize: stats.ksize,
    vsize: stats.vsize,
    count: keys.length,
  };
};

module.exports = {
  cacheMiddleware,
  clearCacheByPattern,
  clearAllCache,
  getCacheStats,
};
