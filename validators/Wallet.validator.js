const Joi = require('joi');

/**
 * Wallet validation schemas using Joi
 */

// Create wallet validation schema
const createWalletSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  Amount: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  HoldAmount: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Hold amount must be a number',
      'number.min': 'Hold amount cannot be negative'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update wallet validation schema
const updateWalletSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.positive': 'User ID must be a positive number'
    }),
  Amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  HoldAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Hold amount must be a number',
      'number.min': 'Hold amount cannot be negative'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get wallet by ID validation schema
const getWalletByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
      Joi.string().pattern(/^\d+$/), // Number as string
      Joi.number().integer().positive() // Number directly
    )
    .required()
    .messages({
      'alternatives.match': 'Wallet ID must be a valid ObjectId or positive number',
      'string.empty': 'Wallet ID is required'
    })
});

// Get all wallets validation schema
const getAllWalletsSchema = Joi.object({
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
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Amount', 'wallet_id')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createWalletSchema,
  updateWalletSchema,
  getWalletByIdSchema,
  getAllWalletsSchema
};

