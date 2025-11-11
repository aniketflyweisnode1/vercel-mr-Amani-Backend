const Joi = require('joi');

/**
 * Category validation schemas using Joi
 */

// Create category validation schema
const createCategorySchema = Joi.object({
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
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  emozji: Joi.string()
    .trim()
    .optional()
    .allow(''),
  image: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update category validation schema
const updateCategorySchema = Joi.object({
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  emozji: Joi.string()
    .trim()
    .optional()
    .allow(''),
  image: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get category by ID validation schema
const getCategoryByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Category ID is required',
      'string.pattern.base': 'Please provide a valid category ID'
    })
});

// Get all categories query validation schema
const getAllCategoriesSchema = Joi.object({
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
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
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
  sortBy: Joi.string()
    .valid('name', 'created_at', 'updated_at', 'category_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at, category_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  getAllCategoriesSchema
};

