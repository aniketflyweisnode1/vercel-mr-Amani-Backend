/**
 * Twilio API utility
 * Handles Twilio SMS, voice calls, and messaging operations
 */

const twilio = require('twilio');
const logger = require('./logger');

// Twilio configuration
const accountSid = 'AC75cd3e730509edb4b5927cc0a5c2f753';
const authToken = 'd311992ec429952c0442c27c700602e7';
const twilioNumber = '+12202411779';

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send SMS message
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number (E.164 format)
 * @param {string} options.body - Message body
 * @param {string} options.from - Sender phone number (optional, defaults to twilioNumber)
 * @returns {Promise<Object>} Message object
 */
const sendSMS = async (options) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    const { to, body, from } = options;

    if (!to || typeof to !== 'string') {
      throw new Error('Recipient phone number (to) is required');
    }

    if (!body || typeof body !== 'string') {
      throw new Error('Message body is required');
    }

    const fromNumber = from || twilioNumber;
    if (!fromNumber) {
      throw new Error('Sender phone number is required. Set TWILIO_PHONE_NUMBER in .env or provide "from" parameter');
    }

    logger.info('Sending SMS via Twilio', { to, from: fromNumber });

    const message = await client.messages.create({
      body: body,
      from: fromNumber,
      to: to
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      price: message.price,
      priceUnit: message.priceUnit
    };
  } catch (error) {
    logger.error('Error sending SMS', { error: error.message, to: options.to });
    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

/**
 * Send WhatsApp message
 * @param {Object} options - WhatsApp options
 * @param {string} options.to - Recipient WhatsApp number (format: whatsapp:+1234567890)
 * @param {string} options.body - Message body
 * @param {string} options.from - Sender WhatsApp number (optional, defaults to twilioNumber with whatsapp: prefix)
 * @returns {Promise<Object>} Message object
 */
const sendWhatsApp = async (options) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    const { to, body, from } = options;

    if (!to || typeof to !== 'string') {
      throw new Error('Recipient WhatsApp number (to) is required');
    }

    if (!body || typeof body !== 'string') {
      throw new Error('Message body is required');
    }

    // Ensure WhatsApp format
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const fromNumber = from 
      ? (from.startsWith('whatsapp:') ? from : `whatsapp:${from}`)
      : (twilioNumber ? `whatsapp:${twilioNumber}` : null);

    if (!fromNumber) {
      throw new Error('Sender WhatsApp number is required. Set TWILIO_PHONE_NUMBER in .env or provide "from" parameter');
    }

    logger.info('Sending WhatsApp message via Twilio', { to: toNumber, from: fromNumber });

    const message = await client.messages.create({
      body: body,
      from: fromNumber,
      to: toNumber
    });

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      price: message.price,
      priceUnit: message.priceUnit
    };
  } catch (error) {
    logger.error('Error sending WhatsApp message', { error: error.message, to: options.to });
    throw new Error(`WhatsApp message sending failed: ${error.message}`);
  }
};

/**
 * Make a phone call
 * @param {Object} options - Call options
 * @param {string} options.to - Recipient phone number (E.164 format)
 * @param {string} options.from - Sender phone number (optional, defaults to twilioNumber)
 * @param {string} options.url - TwiML URL or TwiML instructions
 * @param {string} options.statusCallback - Status callback URL (optional)
 * @returns {Promise<Object>} Call object
 */
const makeCall = async (options) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    const { to, from, url, statusCallback } = options;

    if (!to || typeof to !== 'string') {
      throw new Error('Recipient phone number (to) is required');
    }

    if (!url || typeof url !== 'string') {
      throw new Error('TwiML URL is required');
    }

    const fromNumber = from || twilioNumber;
    if (!fromNumber) {
      throw new Error('Sender phone number is required. Set TWILIO_PHONE_NUMBER in .env or provide "from" parameter');
    }

    logger.info('Making phone call via Twilio', { to, from: fromNumber });

    const callOptions = {
      to: to,
      from: fromNumber,
      url: url
    };

    if (statusCallback) {
      callOptions.statusCallback = statusCallback;
      callOptions.statusCallbackEvent = ['initiated', 'ringing', 'answered', 'completed'];
      callOptions.statusCallbackMethod = 'POST';
    }

    const call = await client.calls.create(callOptions);

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
      direction: call.direction,
      duration: call.duration,
      price: call.price,
      priceUnit: call.priceUnit,
      startTime: call.startTime,
      endTime: call.endTime
    };
  } catch (error) {
    logger.error('Error making phone call', { error: error.message, to: options.to });
    throw new Error(`Phone call failed: ${error.message}`);
  }
};

/**
 * Get message status by SID
 * @param {string} messageSid - Message SID
 * @returns {Promise<Object>} Message details
 */
const getMessageStatus = async (messageSid) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    if (!messageSid || typeof messageSid !== 'string') {
      throw new Error('Message SID is required');
    }

    logger.info('Fetching message status', { messageSid });

    const message = await client.messages(messageSid).fetch();

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      price: message.price,
      priceUnit: message.priceUnit,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    logger.error('Error fetching message status', { error: error.message, messageSid });
    throw new Error(`Failed to fetch message status: ${error.message}`);
  }
};

/**
 * Get call status by SID
 * @param {string} callSid - Call SID
 * @returns {Promise<Object>} Call details
 */
const getCallStatus = async (callSid) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    if (!callSid || typeof callSid !== 'string') {
      throw new Error('Call SID is required');
    }

    logger.info('Fetching call status', { callSid });

    const call = await client.calls(callSid).fetch();

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from,
      direction: call.direction,
      duration: call.duration,
      price: call.price,
      priceUnit: call.priceUnit,
      startTime: call.startTime,
      endTime: call.endTime
    };
  } catch (error) {
    logger.error('Error fetching call status', { error: error.message, callSid });
    throw new Error(`Failed to fetch call status: ${error.message}`);
  }
};

/**
 * Verify phone number (using Twilio Verify service)
 * @param {Object} options - Verification options
 * @param {string} options.phoneNumber - Phone number to verify (E.164 format)
 * @param {string} options.channel - Verification channel ('sms' or 'call', default: 'sms')
 * @param {string} options.verifyServiceSid - Verify Service SID (optional)
 * @returns {Promise<Object>} Verification object
 */
const sendVerificationCode = async (options) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    const { phoneNumber, channel = 'sms', verifyServiceSid } = options;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Phone number is required');
    }

    if (!verifyServiceSid) {
      throw new Error('Verify Service SID is required. Create a Verify Service in Twilio Console and set TWILIO_VERIFY_SERVICE_SID');
    }

    logger.info('Sending verification code', { phoneNumber, channel });

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: phoneNumber,
        channel: channel
      });

    return {
      success: true,
      sid: verification.sid,
      status: verification.status,
      to: verification.to,
      channel: verification.channel,
      valid: verification.valid
    };
  } catch (error) {
    logger.error('Error sending verification code', { error: error.message, phoneNumber: options.phoneNumber });
    throw new Error(`Verification code sending failed: ${error.message}`);
  }
};

/**
 * Verify OTP code
 * @param {Object} options - Verification options
 * @param {string} options.phoneNumber - Phone number to verify (E.164 format)
 * @param {string} options.code - Verification code
 * @param {string} options.verifyServiceSid - Verify Service SID (optional)
 * @returns {Promise<Object>} Verification check result
 */
const verifyCode = async (options) => {
  try {
    if (!accountSid || !authToken) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file');
    }

    const { phoneNumber, code, verifyServiceSid } = options;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Phone number is required');
    }

    if (!code || typeof code !== 'string') {
      throw new Error('Verification code is required');
    }

    if (!verifyServiceSid) {
      throw new Error('Verify Service SID is required. Create a Verify Service in Twilio Console and set TWILIO_VERIFY_SERVICE_SID');
    }

    logger.info('Verifying code', { phoneNumber });

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });

    return {
      success: true,
      sid: verificationCheck.sid,
      status: verificationCheck.status,
      to: verificationCheck.to,
      valid: verificationCheck.valid
    };
  } catch (error) {
    logger.error('Error verifying code', { error: error.message, phoneNumber: options.phoneNumber });
    throw new Error(`Code verification failed: ${error.message}`);
  }
};

module.exports = {
  client,
  sendSMS,
  sendWhatsApp,
  makeCall,
  getMessageStatus,
  getCallStatus,
  sendVerificationCode,
  verifyCode,
  twilioNumber,
  accountSid
};
