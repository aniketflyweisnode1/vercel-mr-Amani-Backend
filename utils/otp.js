
/**
 * Generate a 4-digit OTP
 * @returns {string} 4-digit OTP string
 */
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate OTP with expiration time
 * @param {number} expirationMinutes - OTP expiration time in minutes (default: 5)
 * @returns {Object} Object containing OTP and expiration timestamp
 */
const generateOTPWithExpiry = (expirationMinutes = 5) => {
  const otp = generateOTP();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

  return {
    otp,
    expiresAt
  };
};

/**
 * Verify if OTP is valid (not expired)
 * @param {Date} expiresAt - OTP expiration timestamp
 * @returns {boolean} True if OTP is still valid, false if expired
 */
const isOTPValid = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date() < new Date(expiresAt);
};

/**
 * Verify OTP matches
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiresAt - OTP expiration timestamp
 * @returns {Object} Object with isValid flag and message
 */
const verifyOTP = (providedOTP, storedOTP, expiresAt) => {
  if (!providedOTP || !storedOTP) {
    return {
      isValid: false,
      message: 'OTP is required'
    };
  }

  if (!isOTPValid(expiresAt)) {
    return {
      isValid: false,
      message: 'OTP has expired'
    };
  }

  if (providedOTP !== storedOTP) {
    return {
      isValid: false,
      message: 'Invalid OTP'
    };
  }

  return {
    isValid: true,
    message: 'OTP verified successfully'
  };
};

/**
 * Send SMS message using Twilio
 * @param {string} phoneNumber - Phone number to send message to (with country code, e.g., +1234567890)
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Send result with success status and message SID
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio phone number is not configured');
    }

    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }

    if (!message) {
      throw new Error('Message is required');
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    logger.info('SMS sent successfully', {
      phoneNumber: formattedPhone,
      messageSid: result.sid,
      status: result.status
    });

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      phoneNumber: formattedPhone
    };
  } catch (error) {
    logger.error('Error sending SMS', {
      error: error.message,
      stack: error.stack,
      phoneNumber
    });
    
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - Phone number to send OTP to (with country code, e.g., +1234567890)
 * @param {string} otp - OTP code to send
 * @param {string} message - Custom message (optional)
 * @returns {Promise<Object>} Send result with success status and message SID
 */
const sendOTPViaSMS = async (phoneNumber, otp, message = null) => {
  try {
    if (!otp) {
      throw new Error('OTP is required');
    }

    // Default message if not provided
    const smsMessage = message || `Your OTP code is: ${otp}. This code will expire in 5 minutes.`;

    // Use sendSMS function
    return await sendSMS(phoneNumber, smsMessage);
  } catch (error) {
    logger.error('Error sending OTP via SMS', {
      error: error.message,
      stack: error.stack,
      phoneNumber
    });
    
    throw new Error(`Failed to send OTP via SMS: ${error.message}`);
  }
};

/**
 * Send OTP via SMS with auto-generated OTP
 * @param {string} phoneNumber - Phone number to send OTP to
 * @param {number} expirationMinutes - OTP expiration time in minutes (default: 5)
 * @returns {Promise<Object>} Object containing OTP, expiration, and SMS send result
 */
const generateAndSendOTP = async (phoneNumber, expirationMinutes = 5) => {
  try {
    // Generate OTP with expiration
    const { otp, expiresAt } = generateOTPWithExpiry(expirationMinutes);

    // Send OTP via SMS
    const smsResult = await sendOTPViaSMS(phoneNumber, otp);

    return {
      otp,
      expiresAt,
      smsResult
    };
  } catch (error) {
    logger.error('Error generating and sending OTP', {
      error: error.message,
      phoneNumber
    });
    throw error;
  }
};

module.exports = {
  generateOTP,
  generateOTPWithExpiry,
  isOTPValid,
  verifyOTP,
  sendSMS,
  sendOTPViaSMS,
  generateAndSendOTP
};

