const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    // TTL field for auto-deleting pending users after 24 hours
    pendingExpiry: {
      type: Date,
      default: function () {
        // Default status is 'pending', so set expiry to 24 hours from now
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
      index: { expires: 0 }, // MongoDB will auto-delete document when current time reaches pendingExpiry
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries
    },
    role: {
      type: String,
      enum: ["user", "premium", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["pending", "active", "deleted", "banned"],
      default: "pending",
    },
    profileImage: {
      type: String,
      default: "default-profile.jpg",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otpCode: String,
    otpExpire: Date,
    // OTP rate limiting fields
    otpResendCount: {
      type: Number,
      default: 0,
    },
    otpResendTimestamp: {
      type: Date,
      default: null,
    },
    otpResendRateWindow: {
      type: Date,
      default: null,
    },
    watchHistory: [
      {
        animeId: {
          type: String,
          required: true,
        },
        episodeId: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Number,
          default: 0,
        },
        watched: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TTL index is managed with the pendingExpiry field which is only set for pending users
// The field will automatically be cleared when a user's status changes from pending to active

// Virtual field for watchlist
UserSchema.virtual("watchlist", {
  ref: "WatchList",
  localField: "_id",
  foreignField: "user",
  justOne: true,
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  // For password encryption
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Handle pendingExpiry based on status changes
  if (this.isModified("status")) {
    if (this.status === "pending") {
      // Set expiry for pending users (will auto-delete after 24 hours)
      this.pendingExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Clear expiry for non-pending users to prevent auto-deletion
      this.pendingExpiry = null;
    }
  }

  next();
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP for email verification
UserSchema.methods.generateEmailVerificationToken = function (
  isResend = false
) {
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  // Set expire (10 minutes)
  this.emailVerificationExpire = Date.now() + 10 * 60 * 1000;

  // Store unhashed OTP for sending in email
  this.otpCode = otp;
  this.otpExpire = this.emailVerificationExpire;

  // Handle OTP resend rate limiting
  if (isResend) {
    // Increment resend count
    this.otpResendCount += 1;

    // Update last resend timestamp
    this.otpResendTimestamp = new Date();

    // Set or update rate window (6 hours from first resend in current window)
    if (!this.otpResendRateWindow || this.otpResendRateWindow < new Date()) {
      this.otpResendRateWindow = new Date(Date.now() + 6 * 60 * 60 * 1000);
    }
  }

  return otp;
};

// Generate and hash password reset token
UserSchema.methods.generateResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Check if user can resend OTP (max 3 attempts in 6 hours)
UserSchema.methods.canResendOTP = function () {
  // If no resend attempts yet or rate window has expired, user can resend
  if (
    !this.otpResendCount ||
    !this.otpResendRateWindow ||
    this.otpResendRateWindow < new Date()
  ) {
    return {
      canResend: true,
      remainingTime: 0,
      attemptsLeft: 3,
    };
  }

  // If user has reached max resends (3) within window
  if (this.otpResendCount >= 3) {
    // Calculate remaining time in seconds until rate window expires
    const remainingMs = this.otpResendRateWindow - new Date();
    const remainingSec = Math.ceil(remainingMs / 1000);

    return {
      canResend: false,
      remainingTime: remainingSec,
      attemptsLeft: 0,
      rateExceeded: true,
    };
  }

  // If last resend was less than 60 seconds ago
  if (this.otpResendTimestamp && new Date() - this.otpResendTimestamp < 60000) {
    // Calculate time until next available resend
    const timeSinceLastResend = new Date() - this.otpResendTimestamp;
    const cooldownRemaining = Math.ceil((60000 - timeSinceLastResend) / 1000);

    return {
      canResend: false,
      remainingTime: cooldownRemaining,
      attemptsLeft: 3 - this.otpResendCount,
      cooldown: true,
    };
  }

  // User can resend
  return {
    canResend: true,
    remainingTime: 0,
    attemptsLeft: 3 - this.otpResendCount,
  };
};

// Reset OTP resend tracking
UserSchema.methods.resetOTPResendTracking = function () {
  this.otpResendCount = 0;
  this.otpResendTimestamp = null;
  this.otpResendRateWindow = null;
};

module.exports = mongoose.model("User", UserSchema);
