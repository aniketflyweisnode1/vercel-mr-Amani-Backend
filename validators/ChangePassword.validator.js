const Joi = require('joi');

/**
 * Mobile Verify Schema - Send OTP for password change
 */
const mobileVerifySchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    })
});

/**
 * OTP Verify Schema - Verify OTP for password change
 */
const otpVerifySchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.pattern.base': 'OTP must be a 4-digit number'
    })
});

/**
 * Change Password Schema - Change password after OTP verification
 */
const changePasswordSchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 100 characters'
    })
});

module.exports = {
  mobileVerifySchema,
  otpVerifySchema,
  changePasswordSchema
};
