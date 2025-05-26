const axios = require("axios");
const logger = require("../config/logger");

/**
 * Verify a Cloudflare Turnstile token
 * @param {string} token - The token from client-side Turnstile widget
 * @param {string} ip - The user's IP address (optional)
 * @returns {Promise<boolean>} - True if valid, false if invalid
 */
const verifyTurnstileToken = async (token, ip) => {
  if (!token) {
    logger.warn("Turnstile: No token provided");
    return false;
  }

  try {
    // Get the secret key from environment variables
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      logger.error(
        "Turnstile: Secret key not configured in environment variables"
      );
      return false;
    }

    // Build the form data for verification
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    // Send verification request to Cloudflare
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      logger.warn(`Turnstile verification failed: ${errorCodes?.join(", ")}`);
    }

    return success;
  } catch (error) {
    logger.error(`Turnstile verification error: ${error.message}`);
    return false;
  }
};

module.exports = {
  verifyTurnstileToken,
};
