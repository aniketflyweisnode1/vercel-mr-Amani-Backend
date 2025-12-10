const User = require('../models/User.model');
const { generateOTPWithExpiry, verifyOTP, generateAndSendOTP } = require('../../utils/otp');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Mobile Verify - Send OTP for password change
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const mobileVerify = asyncHandler(async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return sendError(res, 'Phone number is required', 400);
    }

    // Find user by phone number
    const user = await User.findOne({ phoneNo: phoneNo.trim() }).select('+otp +otpExpiresAt +passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      return sendError(res, 'User not found with this phone number', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Generate OTP for password change
    const { otp, expiresAt } = generateOTPWithExpiry(5); // 5 minutes expiry

    // Save OTP to user
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    // Reset password change verification flag
    user.passwordChangeOTPVerified = false;
    user.passwordChangeOTPVerifiedAt = null;
    await user.save();

    // Send OTP via SMS
    try {
      const smsResult = await generateAndSendOTP(user.phoneNo, 5);
      console.info('OTP sent for password change', { 
        userId: user._id, 
        phoneNo: user.phoneNo,
        messageSid: smsResult.smsResult.messageSid 
      });

      sendSuccess(res, {
        message: 'OTP sent successfully for password change',
        phoneNumber: user.phoneNo,
        expiresAt: expiresAt,
        messageSid: smsResult.smsResult.messageSid,
        otp: otp // Remove this in production
      }, 'OTP sent to your phone number for password change');
    } catch (smsError) {
      // If SMS fails, still save OTP and return it (for development)
      console.error('SMS sending failed, but OTP saved', { error: smsError.message });
      sendSuccess(res, {
        message: 'OTP generated successfully',
        phoneNumber: user.phoneNo,
        expiresAt: expiresAt,
        otp: otp // Remove this in production
      }, 'OTP generated for password change (SMS sending failed)');
    }
  } catch (error) {
    console.error('Error in mobile verify for password change', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * OTP Verify - Verify OTP for password change
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const otpVerify = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;

    if (!phoneNo || !otp) {
      return sendError(res, 'Phone number and OTP are required', 400);
    }

    // Find user with OTP
    const user = await User.findOne({ phoneNo: phoneNo.trim() }).select('+otp +otpExpiresAt +passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, user.otp, user.otpExpiresAt);

    if (!otpVerification.isValid) {
      return sendError(res, otpVerification.message, 400);
    }

    // Mark OTP as verified for password change
    user.passwordChangeOTPVerified = true;
    user.passwordChangeOTPVerifiedAt = new Date();
    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    console.info('OTP verified for password change', { userId: user._id, phoneNo: user.phoneNo });

    sendSuccess(res, {
      message: 'OTP verified successfully',
      phoneNumber: user.phoneNo,
      verifiedAt: user.passwordChangeOTPVerifiedAt
    }, 'OTP verified successfully. You can now change your password.');
  } catch (error) {
    console.error('Error in OTP verify for password change', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Change Password - Change password after OTP verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, newPassword } = req.body;

    if (!phoneNo || !newPassword) {
      return sendError(res, 'Phone number and new password are required', 400);
    }

    // Validate password length
    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    if (newPassword.length > 100) {
      return sendError(res, 'Password cannot exceed 100 characters', 400);
    }

    // Find user
    const user = await User.findOne({ phoneNo: phoneNo.trim() }).select('+passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Verify that OTP was verified for password change
    if (!user.passwordChangeOTPVerified) {
      return sendError(res, 'OTP verification required. Please verify OTP first.', 400);
    }

    // Check if OTP verification is still valid (within 10 minutes)
    const verificationTime = user.passwordChangeOTPVerifiedAt;
    if (!verificationTime) {
      return sendError(res, 'OTP verification expired. Please verify OTP again.', 400);
    }

    const now = new Date();
    const verificationAge = (now - new Date(verificationTime)) / 1000 / 60; // in minutes
    if (verificationAge > 10) {
      // Reset verification flag
      user.passwordChangeOTPVerified = false;
      user.passwordChangeOTPVerifiedAt = null;
      await user.save();
      return sendError(res, 'OTP verification expired. Please verify OTP again.', 400);
    }

    // Change password (will be hashed by pre-save middleware)
    user.password = newPassword;
    // Reset password change verification flag
    user.passwordChangeOTPVerified = false;
    user.passwordChangeOTPVerifiedAt = null;
    await user.save();

    console.info('Password changed successfully', { userId: user._id, phoneNo: user.phoneNo });

    sendSuccess(res, {
      message: 'Password changed successfully',
      phoneNumber: user.phoneNo
    }, 'Password changed successfully');
  } catch (error) {
    console.error('Error in change password', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  mobileVerify,
  otpVerify,
  changePassword
};
