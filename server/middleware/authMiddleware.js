const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errorHandler");
const User = require("../models/User");
const logger = require("../config/logger");

/**
 * Protect routes - requires authentication
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user is active
    if (user.status !== "active") {
      if (user.status === "pending") {
        return next(
          new AppError("Please verify your email to activate your account", 403)
        );
      } else if (user.status === "banned") {
        return next(
          new AppError(
            "Your account has been banned. Please contact support.",
            403
          )
        );
      } else if (user.status === "deleted") {
        return next(new AppError("Your account has been deleted.", 403));
      }
      return next(new AppError("Account is not active", 403));
    }

    // Set user in request
    req.user = user;

    // Update last active time once per hour to avoid excessive DB writes
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (user.lastActive < oneHourAgo) {
      user.lastActive = Date.now();
      await user.save({ validateBeforeSave: false });
    }

    next();
  } catch (error) {
    logger.error(`JWT verification error: ${error.message}`);
    return next(new AppError("Not authorized to access this route", 401));
  }
});

/**
 * Verify email is confirmed
 */
exports.requireEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError("Please verify your email first", 403));
  }

  next();
});

/**
 * Authorize by role
 * @param  {...String} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Check if user is premium or admin
 */
exports.isPremiumOrAdmin = asyncHandler(async (req, res, next) => {
  if (!["premium", "admin"].includes(req.user.role)) {
    return next(
      new AppError(
        "This route requires a premium subscription or admin access",
        403
      )
    );
  }

  next();
});

/**
 * Check if user is admin
 */
exports.isAdmin = asyncHandler(async (req, res, next) => {
  if (!["admin"].includes(req.user.role)) {
    return next(new AppError("This route requires admin access", 403));
  }

  next();
});

/**
 * Check if user status is active
 */
exports.requireActiveStatus = asyncHandler(async (req, res, next) => {
  if (req.user.status !== "active") {
    if (req.user.status === "pending") {
      return next(
        new AppError("Please verify your email to activate your account", 403)
      );
    } else if (req.user.status === "banned") {
      return next(
        new AppError(
          "Your account has been banned. Please contact support.",
          403
        )
      );
    } else if (req.user.status === "deleted") {
      return next(new AppError("Your account has been deleted.", 403));
    }
    return next(new AppError("Account is not active", 403));
  }

  next();
});

module.exports = exports;
