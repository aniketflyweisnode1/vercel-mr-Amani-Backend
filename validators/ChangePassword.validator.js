const Joi = require('joi');

/**
 * Mobile Verify Schema - Send OTP for password change
 * Accepts either phoneNo or Email
 */
const mobileVerifySchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (10-15 digits)'
    }),
  Email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    })
}).or('phoneNo', 'Email').messages({
  'object.missing': 'Either phone number or email is required'
});

/**
 * OTP Verify Schema - Verify OTP for password change
 * Accepts either phoneNo or Email
 */
const otpVerifySchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (10-15 digits)'
    }),
  Email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  otp: Joi.string()
    .pattern(/^[0-9]{4}$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.pattern.base': 'OTP must be a 4-digit number'
    })
}).or('phoneNo', 'Email').messages({
  'object.missing': 'Either phone number or email is required'
});

/**
 * Change Password Schema - Change password after OTP verification
 * Accepts either phoneNo or Email
 */
const changePasswordSchema = Joi.object({
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (10-15 digits)'
    }),
  Email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
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
}).or('phoneNo', 'Email').messages({
  'object.missing': 'Either phone number or email is required'
});

module.exports = {
  mobileVerifySchema,
  otpVerifySchema,
  changePasswordSchema
};
