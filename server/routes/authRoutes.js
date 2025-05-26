const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  validateResetToken,
  resetPassword,
  updatePassword,
  logout,
} = require("../controllers/authController");

const {
  protect,
  requireEmailVerified,
} = require("../middleware/authMiddleware");
const { validate, schemas } = require("../middleware/validationMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

module.exports = (router) => {
  // Public routes
  router.post(
    "/api/v1/auth/register",
    validate(schemas.auth.register),
    register
  );
  router.post(
    "/api/v1/auth/login",
    authLimiter,
    validate(schemas.auth.login),
    login
  );
  router.post(
    "/api/v1/auth/verify-email",
    authLimiter,
    validate(schemas.auth.verifyEmail),
    verifyEmail
  );
  router.post(
    "/api/v1/auth/resend-verification",
    authLimiter,
    validate(schemas.auth.forgotPassword),
    resendVerification
  );
  router.post(
    "/api/v1/auth/forgot-password",
    authLimiter,
    validate(schemas.auth.forgotPassword),
    forgotPassword
  );
  router.get(
    "/api/v1/auth/reset-password/:resetToken/validate",
    authLimiter,
    validateResetToken
  );
  router.put(
    "/api/v1/auth/reset-password/:resetToken",
    authLimiter,
    validate(schemas.auth.resetPassword),
    resetPassword
  );

  // Protected routes
  router.get("/api/v1/auth/getme", protect, getMe);
  router.put(
    "/api/v1/auth/update-password",
    protect,
    requireEmailVerified,
    validate(schemas.auth.updatePassword),
    updatePassword
  );
  router.get("/api/v1/auth/logout", protect, logout);
};
