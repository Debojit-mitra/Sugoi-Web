/**
 * Wraps async controller functions to eliminate try-catch blocks
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function that catches errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
