const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const WatchList = require("../models/WatchList");
const emailService = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errorHandler");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../config/logger");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("Email already registered", 400));
  }

  // Create user object but don't save to database yet (IMPROVEMENT #1: Only save after email is sent)
  const user = new User({
    name,
    email,
    password,
  });
  // IMPROVEMENT #2: User remains in 'pending' status and will be auto-deleted after 24 hours if not verified
  // This is handled by the pendingExpiry TTL field in the User model

  // Generate email verification token (OTP)
  const otp = user.generateEmailVerificationToken();

  // Send verification email first before saving user
  try {
    // Try to send verification email
    await emailService.sendVerificationOTP({
      email: user.email,
      name: user.name,
      otp,
    });

    // Save user to database only after successful email sending
    await user.save({ validateBeforeSave: false });

    // Create empty watchlist for user
    await WatchList.create({
      user: user._id,
      items: [],
    });

    // Send response
    return responseFormatter.success(
      res,
      201,
      "User registered successfully. Please verify your email to activate your account",
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      }
    );
  } catch (error) {
    // If email sending fails, don't save the user at all
    logger.error(`Error sending verification email: ${error.message}`);
    return next(new AppError("Error sending verification email", 500));
  }
});

// @desc    Verify email with OTP
// @route   POST /api/v1/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  // Hash OTP
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Find user by email and token
  const user = await User.findOne({
    email,
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Update user verification status and set status to active
  user.isEmailVerified = true;
  user.status = "active";
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  user.otpCode = undefined;
  user.otpExpire = undefined;
  // Clear the pendingExpiry field to prevent auto-deletion
  user.pendingExpiry = null;

  // Reset OTP resend tracking data since email is now verified
  user.resetOTPResendTracking();

  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    logger.error(`Error sending welcome email: ${error.message}`);
    // Continue with verification even if welcome email fails
  }

  // Send token
  const token = generateToken(user._id);

  return responseFormatter.success(res, 200, "Email verified successfully", {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    token,
  });
});

// @desc    Resend verification OTP
// @route   POST /api/v1/auth/resend-verification
// @access  Public
exports.resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError("Email already verified", 400));
  }

  // Check rate limiting
  const rateStatus = user.canResendOTP();

  if (!rateStatus.canResend) {
    // If in cooldown period
    if (rateStatus.cooldown) {
      return next(
        new AppError(
          `Please wait ${rateStatus.remainingTime} seconds before requesting another code`,
          429
        )
      );
    }

    // If max attempts reached
    if (rateStatus.rateExceeded) {
      const hours = Math.floor(rateStatus.remainingTime / 3600);
      const minutes = Math.floor((rateStatus.remainingTime % 3600) / 60);

      return next(
        new AppError(
          `Maximum resend limit reached. Please try again in ${hours}h ${minutes}m`,
          429
        )
      );
    }
  }

  // Generate new OTP (true flag indicates this is a resend)
  const otp = user.generateEmailVerificationToken(true);

  // Send verification email before saving the user's new OTP
  try {
    await emailService.sendVerificationOTP({
      email: user.email,
      name: user.name,
      otp,
    });

    // Only save the user after successful email sending
    await user.save({ validateBeforeSave: false });

    // Calculate remaining attempts for the response
    const updatedStatus = user.canResendOTP();
    const attemptsLeft = updatedStatus.attemptsLeft;

    return responseFormatter.success(
      res,
      200,
      `Verification email resent successfully. You have ${attemptsLeft} ${
        attemptsLeft === 1 ? "attempt" : "attempts"
      } left within this 6-hour period.`,
      { attemptsLeft, nextResendAvailableIn: 60 } // 60 seconds cooldown
    );
  } catch (error) {
    // If email sending fails, no need to update the user
    logger.error(`Error resending verification email: ${error.message}`);
    return next(new AppError("Error resending verification email", 500));
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, turnstileToken } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Verify Turnstile token if provided (or if feature is enabled)
  if (process.env.TURNSTILE_ENABLED !== "false") {
    const { verifyTurnstileToken } = require("../utils/turnstileUtils");
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const isValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!isValid) {
      return next(
        new AppError("Human verification failed. Please try again.", 400)
      );
    }
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Email not registered", 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new AppError("Incorrect password", 401));
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

  // Update last active timestamp
  user.lastActive = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  return responseFormatter.success(res, 200, "Login successful", {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    token,
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // User is already available in req due to the protect middleware
  const user = await User.findById(req.user.id).populate("watchlist");

  return responseFormatter.success(res, 200, "User data retrieved", user);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.CORS_ORIGIN}/auth/reset-password/${resetToken}`;

  try {
    await emailService.sendPasswordReset({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    return responseFormatter.success(res, 200, "Password reset email sent");
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Error sending password reset email: ${error.message}`);
    return next(new AppError("Error sending password reset email", 500));
  }
});

// @desc    Validate reset password token
// @route   GET /api/v1/auth/reset-password/:resetToken/validate
// @access  Public
exports.validateResetToken = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  return responseFormatter.success(res, 200, "Token is valid");
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Send token
  const token = generateToken(user._id);

  return responseFormatter.success(res, 200, "Password reset successful", {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    token,
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return next(new AppError("Current password is incorrect", 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  return responseFormatter.success(res, 200, "Password updated successfully", {
    token,
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // Update last active
  await User.findByIdAndUpdate(req.user.id, {
    lastActive: Date.now(),
  });

  return responseFormatter.success(res, 200, "Logged out successfully");
});
