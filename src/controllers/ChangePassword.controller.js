const User = require('../models/User.model');
const { generateOTPWithExpiry, verifyOTP, generateAndSendOTP, sendOTPViaSMS } = require('../../utils/otp');
const { sendOTPEmail } = require('../../utils/email');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Mobile Verify - Send OTP for password change
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const mobileVerify = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, Email } = req.body;

    // Build query based on phoneNo or Email
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo.trim();
    } else if (Email) {
      query.Email = Email.toLowerCase().trim();
    } else {
      return sendError(res, 'Either phone number or email is required', 400);
    }

    // Find user by phone number or email
    const user = await User.findOne(query).select('+otp +otpExpiresAt +passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      const identifier = phoneNo ? 'phone number' : 'email';
      return sendError(res, `User not found with this ${identifier}`, 404);
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

    // Prepare message text
    const messageText = `Your password change OTP is: ${otp}. This code will expire in 5 minutes.`;

    // Send OTP via Email (if email exists)
    let emailSent = false;
    if (user.Email) {
      try {
        await sendOTPEmail(user.Email.toLowerCase().trim(), otp);
        emailSent = true;
        console.info('Password change OTP email sent', {
          userId: user._id,
          phoneNo: user.phoneNo,
          email: user.Email
        });
      } catch (emailError) {
        console.error('Error sending password change OTP email', {
          error: emailError.message,
          userId: user._id,
          email: user.Email
        });
      }
    }

    // Send OTP via SMS (mobile) - only if phone number exists
    let smsResult = null;
    if (user.phoneNo) {
      try {
        const generated = await generateAndSendOTP(user.phoneNo, 5);
        // generated.otp is a different code; keep DB OTP as the one we generated above
        smsResult = generated.smsResult;
        console.info('Password change OTP SMS sent', {
          userId: user._id,
          phoneNo: user.phoneNo,
          messageSid: smsResult.messageSid
        });
      } catch (smsError) {
        console.error('Error sending password change OTP SMS', {
          error: smsError.message,
          userId: user._id,
          phoneNo: user.phoneNo
        });
      }
    }

    // Determine success message based on what was sent
    let successMessage = 'OTP sent successfully for password change';
    if (emailSent && smsResult) {
      successMessage = 'OTP sent to your email and mobile number for password change';
    } else if (emailSent) {
      successMessage = 'OTP sent to your email for password change';
    } else if (smsResult) {
      successMessage = 'OTP sent to your mobile number for password change';
    }

    sendSuccess(res, {
      message: 'OTP sent successfully for password change',
      phoneNumber: user.phoneNo || null,
      email: user.Email || null,
      expiresAt,
      messageSid: smsResult?.messageSid || null,
      otp // Remove this in production
    }, successMessage);
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
    const { phoneNo, Email, otp } = req.body;

    if (!otp) {
      return sendError(res, 'OTP is required', 400);
    }

    // Build query based on phoneNo or Email
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo.trim();
    } else if (Email) {
      query.Email = Email.toLowerCase().trim();
    } else {
      return sendError(res, 'Either phone number or email is required', 400);
    }

    // Find user with OTP
    const user = await User.findOne(query).select('+otp +otpExpiresAt +passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      const identifier = phoneNo ? 'phone number' : 'email';
      return sendError(res, `User not found with this ${identifier}`, 404);
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

    console.info('OTP verified for password change', { 
      userId: user._id, 
      phoneNo: user.phoneNo,
      email: user.Email 
    });

    sendSuccess(res, {
      message: 'OTP verified successfully',
      phoneNumber: user.phoneNo || null,
      email: user.Email || null,
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
    const { phoneNo, Email, newPassword } = req.body;

    if (!newPassword) {
      return sendError(res, 'New password is required', 400);
    }

    // Validate password length
    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    if (newPassword.length > 100) {
      return sendError(res, 'Password cannot exceed 100 characters', 400);
    }

    // Build query based on phoneNo or Email
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo.trim();
    } else if (Email) {
      query.Email = Email.toLowerCase().trim();
    } else {
      return sendError(res, 'Either phone number or email is required', 400);
    }

    // Find user
    const user = await User.findOne(query).select('+passwordChangeOTPVerified +passwordChangeOTPVerifiedAt');

    if (!user) {
      const identifier = phoneNo ? 'phone number' : 'email';
      return sendError(res, `User not found with this ${identifier}`, 404);
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

    console.info('Password changed successfully', { 
      userId: user._id, 
      phoneNo: user.phoneNo,
      email: user.Email 
    });

    sendSuccess(res, {
      message: 'Password changed successfully',
      phoneNumber: user.phoneNo || null,
      email: user.Email || null
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
