/**
 * Email sending utility
 * Supports sending emails via SMTP (using nodemailer)
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter (configure based on your email service)
const createTransporter = () => {
  // Configure based on environment variables
  // Supports Gmail, SendGrid, AWS SES, etc.
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  };

  // If using OAuth2 (for Gmail)
  if (process.env.SMTP_OAUTH_CLIENT_ID && process.env.SMTP_OAUTH_CLIENT_SECRET) {
    config.auth = {
      type: 'OAuth2',
      user: process.env.SMTP_USER,
      clientId: process.env.SMTP_OAUTH_CLIENT_ID,
      clientSecret: process.env.SMTP_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.SMTP_OAUTH_REFRESH_TOKEN,
      accessToken: process.env.SMTP_OAUTH_ACCESS_TOKEN
    };
  }

  return nodemailer.createTransport(config);
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body
 * @param {Array} options.attachments - Email attachments
 * @param {string} options.from - Sender email (optional, uses default)
 * @returns {Promise<Object>} Email send result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || options.text || '',
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    logger.error('Error sending email', {
      error: error.message,
      stack: error.stack,
      to: options.to
    });
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Email send result
 */
const sendOTPEmail = async (to, otp) => {
  const subject = 'Your OTP Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">OTP Verification</h2>
      <p>Your OTP code is:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 5 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  const text = `Your OTP code is: ${otp}. This code will expire in 5 minutes.`;

  return sendEmail({ to, subject, text, html });
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} name - User name
 * @returns {Promise<Object>} Email send result
 */
const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to Our Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome ${name}!</h2>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
  `;
  const text = `Welcome ${name}! Thank you for joining our platform.`;

  return sendEmail({ to, subject, text, html });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<Object>} Email send result
 */
const sendPasswordResetEmail = async (to, resetToken, resetUrl) => {
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #666; word-break: break-all;">${resetUrl}</p>
      <p style="color: #666; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  const text = `Password Reset: Click this link to reset your password: ${resetUrl}`;

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};

