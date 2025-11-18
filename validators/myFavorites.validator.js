const Joi = require('joi');

const createFavoriteSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  service_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.empty': 'Service ID is required',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Item_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.empty': 'Item ID is required',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateFavoriteSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getFavoriteByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Favorite ID is required',
      'string.pattern.base': 'Please provide a valid favorite ID'
    })
});

const getAllFavoritesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
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
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'myFavorites_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, myFavorites_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getFavoritesByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
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
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    }),
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'myFavorites_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, myFavorites_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createFavoriteSchema,
  updateFavoriteSchema,
  getFavoriteByIdSchema,
  getAllFavoritesSchema,
  getFavoritesByAuthSchema
};

