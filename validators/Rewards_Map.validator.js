const Joi = require('joi');

const createRewardsMapSchema = Joi.object({
  Rewards_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Rewards ID must be a number',
      'number.integer': 'Rewards ID must be an integer',
      'number.positive': 'Rewards ID must be a positive number',
      'any.required': 'Rewards ID is required'
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
  ExpiryDate: Joi.date()
    .optional()
    .allow(null),
  ExpiryStatus: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Expiry status must be a boolean value'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateRewardsMapSchema = Joi.object({
  Rewards_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  ExpiryDate: Joi.date()
    .optional()
    .allow(null),
  ExpiryStatus: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Expiry status must be a boolean value'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRewardsMapByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Rewards map ID must be a valid ObjectId or positive number',
      'string.empty': 'Rewards map ID is required'
    })
});

const getAllRewardsMapsSchema = Joi.object({
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
  ExpiryStatus: Joi.string()
    .valid('true', 'false')
    .optional(),
  Rewards_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  fromExpiryDate: Joi.date()
    .optional(),
  toExpiryDate: Joi.date()
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'ExpiryDate')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

const getRewardsMapByUserIdParamsSchema = Joi.object({
  userId: Joi.alternatives()
    .try(
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'User ID must be a positive number',
      'string.empty': 'User ID is required'
    })
});

const getRewardsMapByUserIdQuerySchema = Joi.object({
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  ExpiryStatus: Joi.string()
    .valid('true', 'false')
    .optional()
});

const getRewardsMapByAuthQuerySchema = Joi.object({
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  ExpiryStatus: Joi.string()
    .valid('true', 'false')
    .optional()
});

module.exports = {
  createRewardsMapSchema,
  updateRewardsMapSchema,
  getRewardsMapByIdSchema,
  getAllRewardsMapsSchema,
  getRewardsMapByUserIdParamsSchema,
  getRewardsMapByUserIdQuerySchema,
  getRewardsMapByAuthQuerySchema
};


