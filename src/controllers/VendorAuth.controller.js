const User = require('../models/User.model');
const { generateOTPWithExpiry } = require('../../utils/otp');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { ensureRoleMatch } = require('../../utils/role.js');

const buildRoleBasedLoginHandler = (allowedRoleNames = [], successMessage = 'OTP sent successfully') => asyncHandler(async (req, res) => {
  const { email, phoneNo } = req.body;

  if (!email && !phoneNo) {
    return sendError(res, 'Email or phone number is required', 400);
  }

  const query = {};
  if (email) {
    query.Email = email.toLowerCase().trim();
  } else if (phoneNo) {
    query.phoneNo = phoneNo.trim();
  }

  const user = await User.findOne(query).select('+otp +otpExpiresAt');

  if (!user) {
    return sendError(res, 'Invalid email/phone number', 401);
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

  const { otp: generatedOtp, expiresAt } = generateOTPWithExpiry(5);

  user.otp = generatedOtp;
  user.otpExpiresAt = expiresAt;
  await user.save();

  console.info('OTP generated for role-based login', {
    userId: user._id,
    user_id: user.user_id,
    role: roleValidation.role?.name
  });

  sendSuccess(res, {
    message: 'OTP sent successfully',
    otp: generatedOtp, // TODO: remove from response in production
    expiresAt
  }, successMessage);
});

const loginVendor = buildRoleBasedLoginHandler(['Vendor'], 'Vendor OTP sent successfully');
const loginAdmin = buildRoleBasedLoginHandler(['Admin'], 'Admin OTP sent successfully');
const loginRestaurant = buildRoleBasedLoginHandler(['Restaurant'], 'Restaurant OTP sent successfully');

module.exports = {
  loginVendor,
  loginAdmin,
  loginRestaurant
};

