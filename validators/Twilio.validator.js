const Joi = require('joi');

const sendSMSSchema = Joi.object({
  to: Joi.string().trim().required().messages({
    'string.base': 'Recipient phone number must be a string',
    'string.empty': 'Recipient phone number cannot be empty',
    'any.required': 'Recipient phone number (to) is required'
  }),
  body: Joi.string().trim().max(1600).required().messages({
    'string.base': 'Message body must be a string',
    'string.empty': 'Message body cannot be empty',
    'string.max': 'Message body cannot exceed 1600 characters',
    'any.required': 'Message body is required'
  }),
  from: Joi.string().trim().optional().messages({
    'string.base': 'Sender phone number must be a string'
  })
});

const sendWhatsAppSchema = Joi.object({
  to: Joi.string().trim().required().messages({
    'string.base': 'Recipient WhatsApp number must be a string',
    'string.empty': 'Recipient WhatsApp number cannot be empty',
    'any.required': 'Recipient WhatsApp number (to) is required'
  }),
  body: Joi.string().trim().max(1600).required().messages({
    'string.base': 'Message body must be a string',
    'string.empty': 'Message body cannot be empty',
    'string.max': 'Message body cannot exceed 1600 characters',
    'any.required': 'Message body is required'
  }),
  from: Joi.string().trim().optional().messages({
    'string.base': 'Sender WhatsApp number must be a string'
  })
});

const makeCallSchema = Joi.object({
  to: Joi.string().trim().required().messages({
    'string.base': 'Recipient phone number must be a string',
    'string.empty': 'Recipient phone number cannot be empty',
    'any.required': 'Recipient phone number (to) is required'
  }),
  from: Joi.string().trim().optional().messages({
    'string.base': 'Sender phone number must be a string'
  }),
  url: Joi.string().trim().uri().required().messages({
    'string.base': 'TwiML URL must be a string',
    'string.empty': 'TwiML URL cannot be empty',
    'string.uri': 'TwiML URL must be a valid URL',
    'any.required': 'TwiML URL is required'
  }),
  statusCallback: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Status callback URL must be a valid URL'
  })
});

const getMessageStatusSchema = Joi.object({
  messageSid: Joi.string().trim().min(1).required().messages({
    'string.base': 'Message SID must be a string',
    'string.empty': 'Message SID cannot be empty',
    'any.required': 'Message SID is required'
  })
});

const getCallStatusSchema = Joi.object({
  callSid: Joi.string().trim().min(1).required().messages({
    'string.base': 'Call SID must be a string',
    'string.empty': 'Call SID cannot be empty',
    'any.required': 'Call SID is required'
  })
});

const sendVerificationSchema = Joi.object({
  phoneNumber: Joi.string().trim().required().messages({
    'string.base': 'Phone number must be a string',
    'string.empty': 'Phone number cannot be empty',
    'any.required': 'Phone number is required'
  }),
  channel: Joi.string().valid('sms', 'call').optional().default('sms').messages({
    'any.only': 'Channel must be either "sms" or "call"'
  }),
  verifyServiceSid: Joi.string().trim().min(1).required().messages({
    'string.base': 'Verify Service SID must be a string',
    'string.empty': 'Verify Service SID cannot be empty',
    'any.required': 'Verify Service SID is required'
  })
});

const verifyCodeSchema = Joi.object({
  phoneNumber: Joi.string().trim().required().messages({
    'string.base': 'Phone number must be a string',
    'string.empty': 'Phone number cannot be empty',
    'any.required': 'Phone number is required'
  }),
  code: Joi.string().trim().min(4).max(10).required().messages({
    'string.base': 'Verification code must be a string',
    'string.empty': 'Verification code cannot be empty',
    'string.min': 'Verification code must be at least 4 characters',
    'string.max': 'Verification code cannot exceed 10 characters',
    'any.required': 'Verification code is required'
  }),
  verifyServiceSid: Joi.string().trim().min(1).required().messages({
    'string.base': 'Verify Service SID must be a string',
    'string.empty': 'Verify Service SID cannot be empty',
    'any.required': 'Verify Service SID is required'
  })
});

module.exports = {
  sendSMSSchema,
  sendWhatsAppSchema,
  makeCallSchema,
  getMessageStatusSchema,
  getCallStatusSchema,
  sendVerificationSchema,
  verifyCodeSchema
};
