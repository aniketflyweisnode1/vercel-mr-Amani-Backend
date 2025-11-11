const Joi = require('joi');

/**
 * City validation schemas using Joi
 */

// Create city validation schema
const createCitySchema = Joi.object({
  state_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'string.empty': 'State ID is required',
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
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
  stateCode: Joi.string()
    .trim()
    .uppercase()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'State code cannot exceed 10 characters'
    }),
  countryCode: Joi.string()
    .trim()
    .uppercase()
    .max(3)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Country code cannot exceed 3 characters'
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update city validation schema
const updateCitySchema = Joi.object({
  state_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
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
  stateCode: Joi.string()
    .trim()
    .uppercase()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'State code cannot exceed 10 characters'
    }),
  countryCode: Joi.string()
    .trim()
    .uppercase()
    .max(3)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Country code cannot exceed 3 characters'
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get city by ID validation schema
const getCityByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'string.empty': 'City ID is required',
      'string.pattern.base': 'Please provide a valid city ID'
    })
});

// Get all cities query validation schema
const getAllCitiesSchema = Joi.object({
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
  state_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('name', 'created_at', 'updated_at', 'city_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at, city_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCitySchema,
  updateCitySchema,
  getCityByIdSchema,
  getAllCitiesSchema
};

