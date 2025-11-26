const Joi = require('joi');

const createFavouritesSchema = Joi.object({
  items: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required',
      'any.required': 'Items array is required'
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

const updateFavouritesSchema = Joi.object({
  items: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .optional()
    .messages({
      'array.base': 'Items must be an array',
      'array.min': 'At least one item is required'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getFavouritesByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Favourites ID must be a valid ObjectId or positive number',
      'string.empty': 'Favourites ID is required'
    })
});

const getAllFavouritesSchema = Joi.object({
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
  search: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Favourites_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, Favourites_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getFavouritesByAuthSchema = Joi.object({
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Favourites_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, Favourites_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getFavouritesByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.empty': 'Business branch ID is required',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    })
});

const getFavouritesByBusinessBranchIdQuerySchema = Joi.object({
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
  search: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  item_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.integer': 'Item ID must be an integer',
      'number.positive': 'Item ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Favourites_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, Favourites_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createFavouritesSchema,
  updateFavouritesSchema,
  getFavouritesByIdSchema,
  getAllFavouritesSchema,
  getFavouritesByAuthSchema,
  getFavouritesByBusinessBranchIdParamsSchema,
  getFavouritesByBusinessBranchIdQuerySchema
};

