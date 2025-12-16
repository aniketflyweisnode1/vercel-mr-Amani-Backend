const Joi = require('joi');

const sendEmailSchema = Joi.object({
  to: Joi.string().trim().email().required().messages({
    'string.base': 'Recipient email must be a string',
    'string.email': 'Recipient email must be a valid email address',
    'string.empty': 'Recipient email cannot be empty',
    'any.required': 'Recipient email address (to) is required'
  }),
  subject: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'Email subject must be a string',
    'string.empty': 'Email subject cannot be empty',
    'string.max': 'Email subject cannot exceed 200 characters',
    'any.required': 'Email subject is required'
  }),
  text: Joi.string().trim().optional().messages({
    'string.base': 'Email text body must be a string'
  }),
  html: Joi.string().trim().optional().messages({
    'string.base': 'Email HTML body must be a string'
  }),
  from: Joi.string().trim().email().optional().messages({
    'string.email': 'Sender email must be a valid email address'
  }),
  attachments: Joi.array().items(
    Joi.object({
      filename: Joi.string().optional(),
      path: Joi.string().optional(),
      content: Joi.string().optional(),
      contentType: Joi.string().optional()
    })
  ).optional().messages({
    'array.base': 'Attachments must be an array'
  })
}).or('text', 'html').messages({
  'object.missing': 'Either text or html email body is required'
});

const sendTestEmailSchema = Joi.object({
  to: Joi.string().trim().email().required().messages({
    'string.base': 'Recipient email must be a string',
    'string.email': 'Recipient email must be a valid email address',
    'string.empty': 'Recipient email cannot be empty',
    'any.required': 'Recipient email address (to) is required'
  }),
  from: Joi.string().trim().email().optional().messages({
    'string.email': 'Sender email must be a valid email address'
  })
});

const sendOTPEmailSchema = Joi.object({
  to: Joi.string().trim().email().required().messages({
    'string.base': 'Recipient email must be a string',
    'string.email': 'Recipient email must be a valid email address',
    'string.empty': 'Recipient email cannot be empty',
    'any.required': 'Recipient email address (to) is required'
  }),
  otp: Joi.string().trim().min(4).max(10).required().messages({
    'string.base': 'OTP code must be a string',
    'string.empty': 'OTP code cannot be empty',
    'string.min': 'OTP code must be at least 4 characters',
    'string.max': 'OTP code cannot exceed 10 characters',
    'any.required': 'OTP code is required'
  })
});

const sendWelcomeEmailSchema = Joi.object({
  to: Joi.string().trim().email().required().messages({
    'string.base': 'Recipient email must be a string',
    'string.email': 'Recipient email must be a valid email address',
    'string.empty': 'Recipient email cannot be empty',
    'any.required': 'Recipient email address (to) is required'
  }),
  name: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'User name must be a string',
    'string.empty': 'User name cannot be empty',
    'string.max': 'User name cannot exceed 200 characters',
    'any.required': 'User name is required'
  })
});

const sendPasswordResetEmailSchema = Joi.object({
  to: Joi.string().trim().email().required().messages({
    'string.base': 'Recipient email must be a string',
    'string.email': 'Recipient email must be a valid email address',
    'string.empty': 'Recipient email cannot be empty',
    'any.required': 'Recipient email address (to) is required'
  }),
  resetToken: Joi.string().trim().optional().messages({
    'string.base': 'Reset token must be a string'
  }),
  resetUrl: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Reset URL must be a valid URL'
  })
}).or('resetToken', 'resetUrl').messages({
  'object.missing': 'Either resetToken or resetUrl is required'
});

module.exports = {
  sendEmailSchema,
  sendTestEmailSchema,
  sendOTPEmailSchema,
  sendWelcomeEmailSchema,
  sendPasswordResetEmailSchema
};
