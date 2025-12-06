const express = require('express');
const router = express.Router();
const {
  sendChatOTP,
  sendOTPToAuthUser,
  resendChatOTP,
  sendChatMessage
} = require('../../controllers/ChatOTP.controller');
const { auth } = require('../../../middleware/auth');

/**
 * @route   POST /api/v2/chat/send-otp
 * @desc    Send OTP to phone number for chat verification
 * @access  Public
 * @body    { phoneNumber: string (required), userId?: number (optional) }
 */
router.post('/send-otp', sendChatOTP);

/**
 * @route   POST /api/v2/chat/send-otp-auth
 * @desc    Send OTP to authenticated user's phone number
 * @access  Private (requires authentication)
 * @body    {}
 */
router.post('/send-otp-auth', auth, sendOTPToAuthUser);

/**
 * @route   POST /api/v2/chat/resend-otp
 * @desc    Resend OTP to phone number
 * @access  Public
 * @body    { phoneNumber: string (required), userId?: number (optional) }
 */
router.post('/resend-otp', resendChatOTP);

/**
 * @route   POST /api/v2/chat/send-message
 * @desc    Send custom message via SMS (for chat notifications)
 * @access  Public
 * @body    { phoneNumber: string (required), message: string (required) }
 */
router.post('/send-message', sendChatMessage);

module.exports = router;
