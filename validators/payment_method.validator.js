const Joi = require('joi');

const createPaymentMethodSchema = Joi.object({
  payment_method: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Payment method is required',
      'string.min': 'Payment method must be at least 2 characters long',
      'string.max': 'Payment method cannot exceed 100 characters'
    }),
  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updatePaymentMethodSchema = Joi.object({
  payment_method: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Payment method must be at least 2 characters long',
      'string.max': 'Payment method cannot exceed 100 characters'
    }),
  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getPaymentMethodByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Payment Method ID must be a valid ObjectId or positive number',
      'string.empty': 'Payment Method ID is required'
    })
});

const getAllPaymentMethodsSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'payment_method')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getPaymentMethodsByAuthSchema = Joi.object({
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
    .valid('created_at', 'updated_at', 'payment_method')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  getPaymentMethodByIdSchema,
  getAllPaymentMethodsSchema,
  getPaymentMethodsByAuthSchema
};

