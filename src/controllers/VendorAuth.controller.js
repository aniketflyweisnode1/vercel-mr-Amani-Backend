const User = require('../models/User.model');
const { generateToken } = require('../../utils/jwt');
const { verifyOTP } = require('../../utils/otp');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const { ensureRoleMatch } = require('../utils/role');

const buildRoleBasedLoginHandler = (allowedRoleNames = [], successMessage = 'Login successful') => asyncHandler(async (req, res) => {
  const { email, phoneNo, otp } = req.body;

  if (!email && !phoneNo) {
    return sendError(res, 'Email or phone number is required', 400);
  }

  if (!otp) {
    return sendError(res, 'OTP is required', 400);
  }

  const query = {};
  if (email) {
    query.Email = email.toLowerCase().trim();
  } else if (phoneNo) {
    query.phoneNo = phoneNo.trim();
  }

  const user = await User.findOne(query).select('+otp +otpExpiresAt');

  if (!user) {
    return sendError(res, 'Invalid email/phone number or OTP', 401);
  }

  if (!user.status) {
    return sendError(res, 'Account is deactivated', 401);
  }

  if (!user.Islogin_permissions) {
    return sendError(res, 'Login permissions are disabled', 403);
  }

  const roleValidation = await ensureRoleMatch(user.role_id, allowedRoleNames);
  if (!roleValidation.isValid) {
    return sendError(res, roleValidation.message, 403);
  }

  if (!user.otp || !user.otpExpiresAt) {
    return sendError(res, 'OTP not generated or expired. Please request a new OTP.', 400);
  }

  const otpVerification = verifyOTP(otp, user.otp, user.otpExpiresAt);

  if (!otpVerification.isValid) {
    return sendError(res, otpVerification.message, 400);
  }

  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const accessTokenPayload = {
    id: user._id,
    user_id: user.user_id,
    email: user.Email,
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

  const userResponse = user.toObject();
  delete userResponse.otp;
  delete userResponse.otpExpiresAt;

  console.info(`${successMessage}`, {
    userId: user._id,
    user_id: user.user_id,
    role: roleValidation.role?.name
  });

  sendSuccess(res, {
    user: userResponse,
    ...tokens
  }, successMessage);
});

const loginVendor = buildRoleBasedLoginHandler(['Vendor'], 'Vendor logged in successfully');
const loginAdmin = buildRoleBasedLoginHandler(['Admin'], 'Admin logged in successfully');
const loginRestaurant = buildRoleBasedLoginHandler(['Restaurant'], 'Restaurant logged in successfully');

module.exports = {
  loginVendor,
  loginAdmin,
  loginRestaurant
};

