const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const {
  sendSMS,
  sendWhatsApp,
  makeCall,
  getMessageStatus,
  getCallStatus,
  sendVerificationCode,
  verifyCode
} = require('../../utils/twilio');

/**
 * Send SMS message
 * @route   POST /api/v2/twilio/send-sms
 * @access  Public
 */
const sendSMSHandler = asyncHandler(async (req, res) => {
  try {
    const { to, body, from } = req.body;

    if (!to) {
      return sendError(res, 'Recipient phone number (to) is required', 400);
    }

    if (!body) {
      return sendError(res, 'Message body is required', 400);
    }

    const result = await sendSMS({ to, body, from });
    return sendSuccess(res, result, 'SMS sent successfully', 200);
  } catch (error) {
    console.error('Error sending SMS', { error: error.message });
    return sendError(res, error.message || 'Failed to send SMS', 500);
  }
});

/**
 * Send WhatsApp message
 * @route   POST /api/v2/twilio/send-whatsapp
 * @access  Public
 */
const sendWhatsAppHandler = asyncHandler(async (req, res) => {
  try {
    const { to, body, from } = req.body;

    if (!to) {
      return sendError(res, 'Recipient WhatsApp number (to) is required', 400);
    }

    if (!body) {
      return sendError(res, 'Message body is required', 400);
    }

    const result = await sendWhatsApp({ to, body, from });
    return sendSuccess(res, result, 'WhatsApp message sent successfully', 200);
  } catch (error) {
    console.error('Error sending WhatsApp message', { error: error.message });
    return sendError(res, error.message || 'Failed to send WhatsApp message', 500);
  }
});

/**
 * Make a phone call
 * @route   POST /api/v2/twilio/make-call
 * @access  Public
 */
const makeCallHandler = asyncHandler(async (req, res) => {
  try {
    const { to, from, url, statusCallback } = req.body;

    if (!to) {
      return sendError(res, 'Recipient phone number (to) is required', 400);
    }

    if (!url) {
      return sendError(res, 'TwiML URL is required', 400);
    }

    const result = await makeCall({ to, from, url, statusCallback });
    return sendSuccess(res, result, 'Call initiated successfully', 200);
  } catch (error) {
    console.error('Error making phone call', { error: error.message });
    return sendError(res, error.message || 'Failed to make phone call', 500);
  }
});

/**
 * Get message status
 * @route   GET /api/v2/twilio/message-status/:messageSid
 * @access  Public
 */
const getMessageStatusHandler = asyncHandler(async (req, res) => {
  try {
    const { messageSid } = req.params;

    if (!messageSid) {
      return sendError(res, 'Message SID is required', 400);
    }

    const result = await getMessageStatus(messageSid);
    return sendSuccess(res, result, 'Message status retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching message status', { error: error.message });
    return sendError(res, error.message || 'Failed to fetch message status', 500);
  }
});

/**
 * Get call status
 * @route   GET /api/v2/twilio/call-status/:callSid
 * @access  Public
 */
const getCallStatusHandler = asyncHandler(async (req, res) => {
  try {
    const { callSid } = req.params;

    if (!callSid) {
      return sendError(res, 'Call SID is required', 400);
    }

    const result = await getCallStatus(callSid);
    return sendSuccess(res, result, 'Call status retrieved successfully', 200);
  } catch (error) {
    console.error('Error fetching call status', { error: error.message });
    return sendError(res, error.message || 'Failed to fetch call status', 500);
  }
});

/**
 * Send verification code
 * @route   POST /api/v2/twilio/send-verification
 * @access  Public
 */
const sendVerificationHandler = asyncHandler(async (req, res) => {
  try {
    const { phoneNumber, channel, verifyServiceSid } = req.body;

    if (!phoneNumber) {
      return sendError(res, 'Phone number is required', 400);
    }

    if (!verifyServiceSid) {
      return sendError(res, 'Verify Service SID is required', 400);
    }

    const result = await sendVerificationCode({
      phoneNumber,
      channel: channel || 'sms',
      verifyServiceSid
    });

    return sendSuccess(res, result, 'Verification code sent successfully', 200);
  } catch (error) {
    console.error('Error sending verification code', { error: error.message });
    return sendError(res, error.message || 'Failed to send verification code', 500);
  }
});

/**
 * Verify code
 * @route   POST /api/v2/twilio/verify-code
 * @access  Public
 */
const verifyCodeHandler = asyncHandler(async (req, res) => {
  try {
    const { phoneNumber, code, verifyServiceSid } = req.body;

    if (!phoneNumber) {
      return sendError(res, 'Phone number is required', 400);
    }

    if (!code) {
      return sendError(res, 'Verification code is required', 400);
    }

    if (!verifyServiceSid) {
      return sendError(res, 'Verify Service SID is required', 400);
    }

    const result = await verifyCode({
      phoneNumber,
      code,
      verifyServiceSid
    });

    return sendSuccess(res, result, 'Code verified successfully', 200);
  } catch (error) {
    console.error('Error verifying code', { error: error.message });
    return sendError(res, error.message || 'Failed to verify code', 500);
  }
});

module.exports = {
  sendSMSHandler,
  sendWhatsAppHandler,
  makeCallHandler,
  getMessageStatusHandler,
  getCallStatusHandler,
  sendVerificationHandler,
  verifyCodeHandler
};
