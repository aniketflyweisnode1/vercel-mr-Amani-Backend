const User = require('../models/User.model');
const { generateOTPWithExpiry } = require('../../utils/otp');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { ensureRoleMatch } = require('../../utils/role.js');
const { sendOTPEmail } = require('../../utils/email');
const { sendSMS } = require('../../utils/twilio');

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

  // Determine target email (prefer request email, then user.Email)
  const targetEmail =
    (email && email.toLowerCase().trim()) ||
    (user.Email && user.Email.toLowerCase().trim());

  if (targetEmail) {
    // Prefer email when available
    try {
      await sendOTPEmail(targetEmail, generatedOtp);
      console.info('OTP email sent for role-based login', {
        userId: user._id,
        user_id: user.user_id,
        role: roleValidation.role?.name,
        email: targetEmail
      });
    } catch (emailError) {
      console.error('Error sending OTP email for role-based login', {
        error: emailError.message,
        userId: user._id,
        user_id: user.user_id,
        role: roleValidation.role?.name,
        email: targetEmail
      });
      // Continue and still return OTP in response as fallback
    }
  } else {
    // Fallback to SMS via Twilio when no email is available
    const targetPhone =
      (phoneNo && phoneNo.trim()) ||
      (user.phoneNo && user.phoneNo.trim());

    if (targetPhone) {
      try {
        await sendSMS({
          to: targetPhone,
          body: `Your OTP code is: ${generatedOtp}. This code will expire in 5 minutes.`
        });
        console.info('OTP SMS sent for role-based login', {
          userId: user._id,
          user_id: user.user_id,
          role: roleValidation.role?.name,
          phoneNo: targetPhone
        });
      } catch (smsError) {
        console.error('Error sending OTP SMS for role-based login', {
          error: smsError.message,
          userId: user._id,
          user_id: user.user_id,
          role: roleValidation.role?.name,
          phoneNo: targetPhone
        });
      }
    } else {
      console.warn('No email or phone number found for user during role-based login, OTP notification not sent', {
        userId: user._id,
        user_id: user.user_id,
        role: roleValidation.role?.name
      });
    }
  }

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

