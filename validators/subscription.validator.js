const Joi = require('joi');

const createSubscriptionSchema = Joi.object({
  Plan_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number',
      'any.required': 'Plan ID is required'
    }),
  planStatus: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Plan status cannot exceed 50 characters'
    }),
  expiryDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Expiry date must be a valid date',
      'any.required': 'Expiry date is required'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  transaction_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Transaction ID must be a number',
      'number.integer': 'Transaction ID must be an integer',
      'number.positive': 'Transaction ID must be a positive number'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateSubscriptionSchema = Joi.object({
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  planStatus: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(''),
  expiryDate: Joi.date()
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  transaction_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getSubscriptionByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Subscription ID must be a valid ObjectId or positive number',
      'string.empty': 'Subscription ID is required'
    })
});

const getAllSubscriptionsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
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
    .optional(),
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'expiryDate')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getSubscriptionsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'expiryDate')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  getSubscriptionByIdSchema,
  getAllSubscriptionsSchema,
  getSubscriptionsByAuthSchema
};

