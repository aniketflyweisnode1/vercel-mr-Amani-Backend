/**
 * OTP utility functions
 */

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

module.exports = {
  generateOTP,
  generateOTPWithExpiry,
  isOTPValid,
  verifyOTP
};

