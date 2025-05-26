const nodemailer = require("nodemailer");
const logger = require("../config/logger");

/**
 * Email Service for sending various types of emails
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter connection only in production
    if (process.env.NODE_ENV === "production") {
      this.verifyConnection();
    }
  }

  /**
   * Verify email connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info("Email server connection established");
    } catch (error) {
      logger.error(`Email server connection failed: ${error.message}`);
    }
  }

  /**
   * Send email verification OTP
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Nodemailer info object
   */
  async sendVerificationOTP({ email, name, otp }) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; padding: 30px 0;">
    <div style="max-width: 600px; margin: auto; background-color: #f9f9fb; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="text-align: center; padding: 10px">
        <img src="https://i.ibb.co/ym5bgfZB/logo.png" alt="Sugoi Logo" style="max-height: 120px;" />
      </div>
      <div style="padding: 10px 30px;">
        <h2 style="color: #5e2ca5; margin-top: 0;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">Thanks for signing up with <strong>Sugoi</strong>! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f1e9fc; padding: 15px; text-align: center; font-size: 28px; letter-spacing: 6px; font-weight: bold; color: #5e2ca5; margin: 25px 0; border-radius: 6px;">
          ${otp}
        </div>
        <p style="font-size: 15px; color: #555;">This OTP will expire in 10 minutes.</p>
        <p style="font-size: 15px; color: #555; margin-top: -10px;">If you didn’t request this email, you can safely ignore it.</p>
        <p style="font-size: 15px; color: #555; margin-top: 30px;">Best regards,<br><strong>Team Sugoi</strong></p>
      </div>
      <div style="text-align: center; background-color: #f1e9fc; padding: 15px; font-size: 13px; color: #5e2ca5;">
        &copy; ${new Date().getFullYear()} Sugoi. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(
        `Error sending verification email to ${email}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Nodemailer info object
   */
  async sendPasswordReset({ email, name, resetUrl }) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; padding: 30px 0;">
    <div style="max-width: 600px; margin: auto; background-color: #f9f9fb; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="text-align: center; padding: 10px;">
        <img src="https://i.ibb.co/ym5bgfZB/logo.png" alt="Sugoi Logo" style="max-height: 120px;" />
      </div>
      <div style="padding: 10px 30px;">
        <h2 style="color: #5e2ca5; margin-top: 0;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your password. Click the button below to proceed:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #5e2ca5; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 15px; color: #555;">This link will expire in 10 minutes.</p>
        <p style="font-size: 15px; color: #555; margin-top: -10px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="font-size: 15px; color: #555; margin-top: 30px;">Best regards,<br><strong>Team Sugoi</strong></p>
      </div>
      <div style="text-align: center; background-color: #f1e9fc; padding: 15px; font-size: 13px; color: #5e2ca5;">
        &copy; ${new Date().getFullYear()} Sugoi. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(
        `Error sending password reset email to ${email}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Nodemailer info object
   */
  async sendWelcomeEmail({ email, name }) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Welcome to Sugoi!",
      html: `
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Sugoi!</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; padding: 30px 0;">
    <div style="max-width: 600px; margin: auto; background-color: #f9f9fb; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
      <div style="text-align: center; padding: 10px;">
        <img src="https://i.ibb.co/ym5bgfZB/logo.png" alt="Sugoi Logo" style="max-height: 120px;" />
      </div>
      <div style="padding: 10px 30px;">
        <h2 style="color: #5e2ca5; margin-top: 0;">Welcome to Sugoi!</h2>
        <p style="font-size: 16px; color: #333;">Hello ${name},</p>
        <p style="font-size: 16px; color: #333;">Thank you for joining <strong>Sugoi</strong>! We're thrilled to have you in our anime-loving community.</p>
        <p style="font-size: 16px; color: #333;">Here's what you can do now:</p>
        <ul style="font-size: 16px; color: #333; padding-left: 20px; line-height: 1.6;">
          <li>Browse our extensive anime collection</li>
          <li>Create your personal watchlist</li>
          <li>Track your viewing progress</li>
          <li>Rate and review your favorite shows</li>
        </ul>
        <p style="font-size: 15px; color: #555;">Need help? Our support team is here for you anytime.</p>
        <p style="font-size: 15px; color: #555; margin-top: 30px;">Happy watching!<br><strong>Team Sugoi</strong></p>
      </div>
      <div style="text-align: center; background-color: #f1e9fc; padding: 15px; font-size: 13px; color: #5e2ca5;">
        &copy; ${new Date().getFullYear()} Sugoi. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Error sending welcome email to ${email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send premium subscription confirmation
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Nodemailer info object
   */
  async sendPremiumConfirmation({ email, name }) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Premium Subscription Activated!",
      html: `
       <body style="background-color: #f9f9fb;>
    <div style="font-family: Arial, sans-serif; background-color: #f9f9fb; padding: 30px 0; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="max-width: 600px; margin: auto; background-color: #f9f9fb; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
    <div style="font-family: Arial, sans-serif; background-color: #f9f9fb; padding: 30px 0;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
        <div style="text-align: center; padding: 10px;">
          <img src="https://i.ibb.co/ym5bgfZB/logo.png" alt="Sugoi Logo" style="max-height: 120px;" />
        </div>
        <div style="padding: 10px 30px;">
          <h2 style="color: #5e2ca5; margin-top: 0;">Premium Subscription Activated!</h2>
          <p style="font-size: 16px; color: #333;">Hello ${name},</p>
          <p style="font-size: 16px; color: #333;">Thank you for upgrading to <strong>Sugoi Premium</strong>! Your subscription has been successfully activated and your account now has access to all premium features.</p>
          <p style="font-size: 16px; color: #333;">As a premium member, you now enjoy:</p>
          <ul style="font-size: 16px; color: #333; padding-left: 20px; line-height: 1.6;">
            <li>Ad-free viewing experience</li>
            <li>Early access to new episodes</li>
            <li>Higher quality video streaming</li>
            <li>Exclusive anime content</li>
            <li>Advanced tracking features</li>
          </ul>
          <p style="font-size: 15px; color: #555;">If you have any questions or need help with your premium account, feel free to contact our support team.</p>
          <p style="font-size: 15px; color: #555; margin-top: 30px;">Enjoy the premium experience!<br><strong>Team Sugoi</strong></p>
        </div>
        <div style="text-align: center; background-color: #f1e9fc; padding: 15px; font-size: 13px; color: #5e2ca5;">
          &copy; ${new Date().getFullYear()} Sugoi. All rights reserved.
        </div>
      </div>
    </div>
    </body>
  `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Premium confirmation email sent to ${email}: ${info.messageId}`
      );
      return info;
    } catch (error) {
      logger.error(
        `Error sending premium confirmation email to ${email}: ${error.message}`
      );
      throw error;
    }
  }
}

module.exports = new EmailService();
