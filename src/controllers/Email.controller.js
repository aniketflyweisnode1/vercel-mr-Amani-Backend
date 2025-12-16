const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
} = require('../../utils/email');

/**
 * Send email
 * @route   POST /api/v2/email/send
 * @access  Public
 */
const sendEmailHandler = asyncHandler(async (req, res) => {
  try {
    const { to, subject, text, html, from, attachments } = req.body;

    if (!to) {
      return sendError(res, 'Recipient email address (to) is required', 400);
    }

    if (!subject) {
      return sendError(res, 'Email subject is required', 400);
    }

    if (!text && !html) {
      return sendError(res, 'Either text or html email body is required', 400);
    }

    const result = await sendEmail({
      to,
      subject,
      text,
      html,
      from,
      attachments
    });

    return sendSuccess(res, result, 'Email sent successfully', 200);
  } catch (error) {
    console.error('Error sending email', { error: error.message });
    return sendError(res, error.message || 'Failed to send email', 500);
  }
});

/**
 * Send test email
 * @route   POST /api/v2/email/send-test
 * @access  Public
 */
const sendTestEmailHandler = asyncHandler(async (req, res) => {
  try {
    const { to, from } = req.body;

    if (!to) {
      return sendError(res, 'Recipient email address (to) is required', 400);
    }

    const subject = 'Test Email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Test Email</h2>
        <p>This is a test email sent from the API.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Status:</strong> Email service is working correctly!</p>
        </div>
        <p>If you received this email, your email configuration is set up properly.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated test message.</p>
      </div>
    `;
    const text = `Test Email\n\nThis is a test email sent from the API.\nTimestamp: ${new Date().toISOString()}\nStatus: Email service is working correctly!`;

    const result = await sendEmail({
      to,
      subject,
      text,
      html,
      from
    });

    return sendSuccess(res, result, 'Test email sent successfully', 200);
  } catch (error) {
    console.error('Error sending test email', { error: error.message });
    return sendError(res, error.message || 'Failed to send test email', 500);
  }
});

/**
 * Send OTP email
 * @route   POST /api/v2/email/send-otp
 * @access  Public
 */
const sendOTPEmailHandler = asyncHandler(async (req, res) => {
  try {
    const { to, otp } = req.body;

    if (!to) {
      return sendError(res, 'Recipient email address (to) is required', 400);
    }

    if (!otp) {
      return sendError(res, 'OTP code is required', 400);
    }

    const result = await sendOTPEmail(to, otp);
    return sendSuccess(res, result, 'OTP email sent successfully', 200);
  } catch (error) {
    console.error('Error sending OTP email', { error: error.message });
    return sendError(res, error.message || 'Failed to send OTP email', 500);
  }
});

/**
 * Send welcome email
 * @route   POST /api/v2/email/send-welcome
 * @access  Public
 */
const sendWelcomeEmailHandler = asyncHandler(async (req, res) => {
  try {
    const { to, name } = req.body;

    if (!to) {
      return sendError(res, 'Recipient email address (to) is required', 400);
    }

    if (!name) {
      return sendError(res, 'User name is required', 400);
    }

    const result = await sendWelcomeEmail(to, name);
    return sendSuccess(res, result, 'Welcome email sent successfully', 200);
  } catch (error) {
    console.error('Error sending welcome email', { error: error.message });
    return sendError(res, error.message || 'Failed to send welcome email', 500);
  }
});

/**
 * Send password reset email
 * @route   POST /api/v2/email/send-password-reset
 * @access  Public
 */
const sendPasswordResetEmailHandler = asyncHandler(async (req, res) => {
  try {
    const { to, resetToken, resetUrl } = req.body;

    if (!to) {
      return sendError(res, 'Recipient email address (to) is required', 400);
    }

    if (!resetToken && !resetUrl) {
      return sendError(res, 'Either resetToken or resetUrl is required', 400);
    }

    // If resetUrl is not provided, construct it from resetToken
    const finalResetUrl = resetUrl || `http://localhost:3000/reset-password?token=${resetToken}`;

    const result = await sendPasswordResetEmail(to, resetToken, finalResetUrl);
    return sendSuccess(res, result, 'Password reset email sent successfully', 200);
  } catch (error) {
    console.error('Error sending password reset email', { error: error.message });
    return sendError(res, error.message || 'Failed to send password reset email', 500);
  }
});

module.exports = {
  sendEmailHandler,
  sendTestEmailHandler,
  sendOTPEmailHandler,
  sendWelcomeEmailHandler,
  sendPasswordResetEmailHandler
};
