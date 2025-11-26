const Joi = require('joi');

const createRewardsSchema = Joi.object({
  Rewards_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Rewards type ID must be a number',
      'number.integer': 'Rewards type ID must be an integer',
      'number.positive': 'Rewards type ID must be a positive number',
      'any.required': 'Rewards type ID is required'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image path cannot exceed 500 characters'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  expiryDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Expiry days must be a number',
      'number.integer': 'Expiry days must be an integer',
      'number.min': 'Expiry days cannot be negative'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateRewardsSchema = Joi.object({
  Rewards_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Rewards type ID must be a number',
      'number.integer': 'Rewards type ID must be an integer',
      'number.positive': 'Rewards type ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),
  expiryDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Expiry days must be a number',
      'number.integer': 'Expiry days must be an integer',
      'number.min': 'Expiry days cannot be negative'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRewardsByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Rewards ID must be a valid ObjectId or positive number',
      'string.empty': 'Rewards ID is required'
    })
});

const getAllRewardsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  minPrice: Joi.number()
    .min(0)
    .optional(),
  maxPrice: Joi.number()
    .min(0)
    .optional(),
  Rewards_type_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'name', 'price', 'expiryDays')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

const getRewardsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'name', 'price', 'expiryDays')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

module.exports = {
  createRewardsSchema,
  updateRewardsSchema,
  getRewardsByIdSchema,
  getAllRewardsSchema,
  getRewardsByAuthSchema
};


