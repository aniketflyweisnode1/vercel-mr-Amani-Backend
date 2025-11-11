const Joi = require('joi');

/**
 * ContactUs validation schemas using Joi
 */

// Contact info schema for phoneCall, Email, ChatWhatsapp
const contactInfoSchema = Joi.object({
  MobileNo: Joi.string()
    .trim()
    .optional()
    .allow(''),
  Emozi: Joi.string()
    .trim()
    .optional()
    .allow(''),
  LineText: Joi.string()
    .trim()
    .optional()
    .allow('')
});

// Email contact info schema
const emailContactInfoSchema = Joi.object({
  mail: Joi.string()
    .trim()
    .optional()
    .allow(''),
  Emozi: Joi.string()
    .trim()
    .optional()
    .allow(''),
  LineText: Joi.string()
    .trim()
    .optional()
    .allow('')
});

// Create contact us validation schema
const createContactUsSchema = Joi.object({
  phoneCall: Joi.array()
    .items(contactInfoSchema)
    .optional()
    .default([]),
  Email: Joi.array()
    .items(emailContactInfoSchema)
    .optional()
    .default([]),
  ChatWhatsapp: Joi.array()
    .items(contactInfoSchema)
    .optional()
    .default([]),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update contact us validation schema
const updateContactUsSchema = Joi.object({
  phoneCall: Joi.array()
    .items(contactInfoSchema)
    .optional(),
  Email: Joi.array()
    .items(emailContactInfoSchema)
    .optional(),
  ChatWhatsapp: Joi.array()
    .items(contactInfoSchema)
    .optional(),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get contact us by ID validation schema
const getContactUsByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
      Joi.string().pattern(/^\d+$/), // Number as string
      Joi.number().integer().positive() // Number directly
    )
    .required()
    .messages({
      'alternatives.match': 'ContactUs ID must be a valid ObjectId or positive number',
      'string.empty': 'ContactUs ID is required'
    })
});

// Get all contact us validation schema
const getAllContactUsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createContactUsSchema,
  updateContactUsSchema,
  getContactUsByIdSchema,
  getAllContactUsSchema
};

