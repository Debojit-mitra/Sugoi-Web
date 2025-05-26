const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["verification", "password-reset"],
    default: "verification",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // Auto-delete after 15 minutes (900 seconds)
  },
});

module.exports = mongoose.model("OTP", OTPSchema);
