const User = require('../models/User.model');
const { generateAndSendOTP, sendOTPViaSMS, generateOTPWithExpiry } = require('../../utils/otp');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Send OTP to phone number for chat verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendChatOTP = asyncHandler(async (req, res) => {
  try {
    const { phoneNumber, userId } = req.body;

    // Validate phone number
    if (!phoneNumber) {
      return sendError(res, 'Phone number is required', 400);
    }

    // If userId is provided, verify user exists
    let user = null;
    if (userId) {
      user = await User.findOne({ user_id: parseInt(userId, 10), status: true });
      if (!user) {
        return sendError(res, 'User not found or inactive', 404);
      }
    }

    // Generate and send OTP
    const { otp, expiresAt, smsResult } = await generateAndSendOTP(phoneNumber, 5);

    // If user exists, save OTP to user record
    if (user) {
      user.otp = otp;
      user.otpExpiresAt = expiresAt;
      await user.save();
    }

    console.info('Chat OTP sent successfully', {
      phoneNumber,
      userId: user?._id,
      messageSid: smsResult.messageSid
    });

    sendSuccess(res, {
      message: 'OTP sent successfully',
      phoneNumber,
      expiresAt,
      messageSid: smsResult.messageSid,
      // Remove OTP from response in production
      // otp: otp
    }, 'OTP sent to phone number successfully');
  } catch (error) {
    console.error('Error sending chat OTP', {
      error: error.message,
      stack: error.stack,
      phoneNumber: req.body.phoneNumber
    });
    throw error;
  }
});

/**
 * Send OTP to authenticated user's phone number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendOTPToAuthUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.userIdNumber;

    if (!userId) {
      return sendError(res, 'Authenticated user ID not found', 401);
    }

    // Get authenticated user
    const user = await User.findOne({ user_id: userId, status: true }).select('+otp +otpExpiresAt');

    if (!user) {
      return sendError(res, 'User not found or inactive', 404);
    }

    if (!user.phoneNo) {
      return sendError(res, 'Phone number not found for user', 400);
    }

    // Generate and send OTP
    const { otp, expiresAt, smsResult } = await generateAndSendOTP(user.phoneNo, 5);

    // Save OTP to user record
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    console.info('OTP sent to authenticated user', {
      userId: user._id,
      phoneNumber: user.phoneNo,
      messageSid: smsResult.messageSid
    });

    sendSuccess(res, {
      message: 'OTP sent successfully',
      phoneNumber: user.phoneNo,
      expiresAt,
      messageSid: smsResult.messageSid
    }, 'OTP sent to your phone number successfully');
  } catch (error) {
    console.error('Error sending OTP to authenticated user', {
      error: error.message,
      stack: error.stack,
      userId: req.userIdNumber
    });
    throw error;
  }
});

/**
 * Resend OTP to phone number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resendChatOTP = asyncHandler(async (req, res) => {
  try {
    const { phoneNumber, userId } = req.body;

    if (!phoneNumber) {
      return sendError(res, 'Phone number is required', 400);
    }

    // If userId is provided, verify user exists
    let user = null;
    if (userId) {
      user = await User.findOne({ user_id: parseInt(userId, 10), status: true });
      if (!user) {
        return sendError(res, 'User not found or inactive', 404);
      }
    }

    // Generate and send new OTP
    const { otp, expiresAt, smsResult } = await generateAndSendOTP(phoneNumber, 5);

    // If user exists, save OTP to user record
    if (user) {
      user.otp = otp;
      user.otpExpiresAt = expiresAt;
      await user.save();
    }

    console.info('Chat OTP resent successfully', {
      phoneNumber,
      userId: user?._id,
      messageSid: smsResult.messageSid
    });

    sendSuccess(res, {
      message: 'OTP resent successfully',
      phoneNumber,
      expiresAt,
      messageSid: smsResult.messageSid
    }, 'OTP resent to phone number successfully');
  } catch (error) {
    console.error('Error resending chat OTP', {
      error: error.message,
      stack: error.stack,
      phoneNumber: req.body.phoneNumber
    });
    throw error;
  }
});

/**
 * Send custom message via SMS (for chat notifications)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendChatMessage = asyncHandler(async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return sendError(res, 'Phone number is required', 400);
    }

    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    // Send message via SMS
    const smsResult = await sendSMS(phoneNumber, message);

    console.info('Chat message sent via SMS', {
      phoneNumber,
      messageSid: smsResult.messageSid
    });

    sendSuccess(res, {
      message: 'Message sent successfully',
      phoneNumber,
      messageSid: smsResult.messageSid,
      status: smsResult.status
    }, 'Message sent successfully');
  } catch (error) {
    console.error('Error sending chat message', {
      error: error.message,
      stack: error.stack,
      phoneNumber: req.body.phoneNumber
    });
    throw error;
  }
});

module.exports = {
  sendChatOTP,
  sendOTPToAuthUser,
  resendChatOTP,
  sendChatMessage
};
