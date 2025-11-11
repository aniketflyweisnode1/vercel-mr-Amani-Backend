const Joi = require('joi');

/**
 * Vendor validation schemas using Joi
 */

// Vendor login validation schema (email or phoneNo with OTP)
const loginVendorSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  phoneNo: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
  otp: Joi.string()
    .required()
    .messages({
      'string.empty': 'OTP is required'
    })
}).or('email', 'phoneNo').messages({
  'object.missing': 'Either email or phone number is required'
});

module.exports = {
  loginVendorSchema
};

