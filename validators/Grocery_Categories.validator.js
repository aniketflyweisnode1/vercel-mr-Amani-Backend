const Joi = require('joi');

const createGroceryCategoriesSchema = Joi.object({
  Name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),
  Coverimage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Cover image must be a string',
      'string.max': 'Cover image path cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateGroceryCategoriesSchema = Joi.object({
  Name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  Coverimage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Cover image must be a string',
      'string.max': 'Cover image path cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1)
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

const getGroceryCategoriesByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Grocery Categories ID must be a valid ObjectId or positive number',
      'string.empty': 'Grocery Categories ID is required'
    })
});

const getAllGroceryCategoriesSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('Name', 'created_at', 'updated_at', 'Grocery_Categories_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Name, created_at, updated_at, Grocery_Categories_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getGroceryCategoriesByAuthSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('Name', 'created_at', 'updated_at', 'Grocery_Categories_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Name, created_at, updated_at, Grocery_Categories_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createGroceryCategoriesSchema,
  updateGroceryCategoriesSchema,
  getGroceryCategoriesByIdSchema,
  getAllGroceryCategoriesSchema,
  getGroceryCategoriesByAuthSchema
};

