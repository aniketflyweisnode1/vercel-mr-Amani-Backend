const User = require('../models/User.model');
const { generateOTPWithExpiry, verifyOTP } = require('../../utils/otp');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const { ensureRoleMatch } = require('../utils/role');

const normalizeRolesInput = (roleInput) => {
  if (!roleInput) return [];
  if (Array.isArray(roleInput)) {
    return roleInput
      .map((role) => (typeof role === 'string' ? role.trim() : role))
      .filter(Boolean);
  }
  if (typeof roleInput === 'string' && roleInput.trim()) {
    return [roleInput.trim()];
  }
  return [];
};

/**
 * User login - send OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const userLogin = asyncHandler(async (req, res) => {
  try {
    const { phoneNo } = req.body;

    // Find or create user
    let user = await User.findOne({ phoneNo }).select('+otp +otpExpiresAt');

    if (!user) {
      // Create new user if doesn't exist
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Check if user has login permissions
    if (!user.Islogin_permissions) {
      return sendError(res, 'Login permissions are disabled', 403);
    }

    // Validate role
    const roleValidation = await ensureRoleMatch(user.role_id, ['User']);
    if (!roleValidation.isValid) {
      return sendError(res, roleValidation.message, 403);
    }

    // Check if user Status is active
    if (!user.status) {
      return sendError(res, 'Account status is inactive', 403);
    }

    // Generate OTP
    const { otp, expiresAt } = generateOTPWithExpiry(5); // 5 minutes expiry

    // Save OTP to user
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    console.info('OTP sent successfully', { userId: user._id, phoneNo: user.phoneNo });

    // In production, send OTP via SMS/Email
    // For now, we'll return it in response (remove in production)
    sendSuccess(res, {
      message: 'OTP sent successfully',
      otp: otp, // Remove this in production
      expiresAt: expiresAt
    }, 'OTP sent to your phone number');
  } catch (error) {
    console.error('Error in user login', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Resend OTP for existing user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resendOTP = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, email, role } = req.body;

    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo.trim();
    }
    if (email) {
      query.Email = email.toLowerCase().trim();
    }

    const user = await User.findOne(query).select('+otp +otpExpiresAt');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    if (!user.Islogin_permissions) {
      return sendError(res, 'Login permissions are disabled', 403);
    }

    const allowedRoles = normalizeRolesInput(role);
    if (allowedRoles.length) {
      const roleValidation = await ensureRoleMatch(user.role_id, allowedRoles);
      if (!roleValidation.isValid) {
        return sendError(res, roleValidation.message, 403);
      }
    }

    const { otp, expiresAt } = generateOTPWithExpiry(5);

    user.otp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    console.info('OTP resent successfully', {
      userId: user._id,
      phoneNo: user.phoneNo,
      email: user.Email
    });

    sendSuccess(res, {
      message: 'OTP resent successfully',
      otp,
      expiresAt
    }, 'OTP resent successfully');
  } catch (error) {
    console.error('Error resending OTP', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Verify OTP and return user details with JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyOTPHandler = asyncHandler(async (req, res) => {
  try {
    const { phoneNo, otp, role } = req.body;

    // Find user with OTP
    const user = await User.findOne({ phoneNo }).select('+otp +otpExpiresAt');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Check if user has login permissions
    if (!user.Islogin_permissions) {
      return sendError(res, 'Login permissions are disabled', 403);
    }

    // Validate role - allow User, Restaurant, Vendor, Admin roles
    const allowedRoles = role ? [role] : ['User', 'Restaurant', 'Vendor', 'Admin'];
    const roleValidation = await ensureRoleMatch(user.role_id, allowedRoles);
    if (!roleValidation.isValid) {
      return sendError(res, roleValidation.message, 403);
    }

    // Check if user Status is active
    if (!user.status) {
      return sendError(res, 'Account status is inactive', 403);
    }

    // Verify OTP
    const otpVerification = verifyOTP(otp, user.otp, user.otpExpiresAt);

    if (!otpVerification.isValid) {
      return sendError(res, otpVerification.message, 400);
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Generate JWT tokens with user data
    const accessTokenPayload = {
      id: user._id,
      user_id: user.user_id,
      phoneNo: user.phoneNo,
      firstName: user.firstName,
      lastName: user.lastName,
      role_id: user.role_id,
      type: 'access'
    };

    const refreshTokenPayload = {
      id: user._id,
      user_id: user.user_id,
      role_id: user.role_id,
      type: 'refresh'
    };

    const tokens = {
      accessToken: generateToken(accessTokenPayload, process.env.JWT_SECRET || 'newuserToken', '7d'),
      refreshToken: generateToken(refreshTokenPayload, process.env.JWT_SECRET || 'newuserToken', '30d')
    };

    // Remove OTP from user object
    const userResponse = user.toObject();
    delete userResponse.otp;
    delete userResponse.otpExpiresAt;

    console.info('OTP verified successfully', { userId: user._id, phoneNo: user.phoneNo });

    sendSuccess(res, {
      user: userResponse,
      ...tokens
    }, 'OTP verified successfully');
  } catch (error) {
    console.error('Error verifying OTP', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * User logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const userLogout = asyncHandler(async (req, res) => {
  try {
    // User is already authenticated via auth middleware
    // The token is valid, so we just return success
    // Client should discard the token on their end
    
    console.info('User logged out successfully', { 
      userId: req.userId, 
      userIdNumber: req.userIdNumber,
      phoneNo: req.user?.phoneNo 
    });

    sendSuccess(res, {
      message: 'Logged out successfully'
    }, 'Logged out successfully');
  } catch (error) {
    console.error('Error in user logout', { error: error.message, stack: error.stack });
    throw error;
  }
});

module.exports = {
  userLogin,
  resendOTP,
  verifyOTPHandler,
  userLogout
};

