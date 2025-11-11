const Joi = require('joi');

/**
 * Country validation schemas using Joi
 */

// Create country validation schema
const createCountrySchema = Joi.object({
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
  isoCode: Joi.string()
    .trim()
    .uppercase()
    .max(3)
    .optional()
    .allow('')
    .messages({
      'string.max': 'ISO code cannot exceed 3 characters'
    }),
  code2: Joi.string()
    .trim()
    .uppercase()
    .length(2)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Code2 must be exactly 2 characters'
    }),
  code3: Joi.string()
    .trim()
    .uppercase()
    .length(3)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Code3 must be exactly 3 characters'
    }),
  phonecode: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Phone code cannot exceed 10 characters'
    }),
  capital: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Capital cannot exceed 100 characters'
    }),
  currency: Joi.string()
    .trim()
    .uppercase()
    .length(3)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Currency code must be exactly 3 characters'
    }),
  flag: Joi.string()
    .trim()
    .optional()
    .allow(''),
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
  timezones: Joi.array()
    .items(Joi.object({
      zoneName: Joi.string().trim().optional().allow(''),
      gmtOffset: Joi.number().optional(),
      gmtOffsetName: Joi.string().trim().optional().allow(''),
      abbreviation: Joi.string().trim().optional().allow(''),
      tzName: Joi.string().trim().optional().allow('')
    }))
    .optional(),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update country validation schema
const updateCountrySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  isoCode: Joi.string()
    .trim()
    .uppercase()
    .max(3)
    .optional()
    .allow('')
    .messages({
      'string.max': 'ISO code cannot exceed 3 characters'
    }),
  code2: Joi.string()
    .trim()
    .uppercase()
    .length(2)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Code2 must be exactly 2 characters'
    }),
  code3: Joi.string()
    .trim()
    .uppercase()
    .length(3)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Code3 must be exactly 3 characters'
    }),
  phonecode: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Phone code cannot exceed 10 characters'
    }),
  capital: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Capital cannot exceed 100 characters'
    }),
  currency: Joi.string()
    .trim()
    .uppercase()
    .length(3)
    .optional()
    .allow('')
    .messages({
      'string.length': 'Currency code must be exactly 3 characters'
    }),
  flag: Joi.string()
    .trim()
    .optional()
    .allow(''),
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
  timezones: Joi.array()
    .items(Joi.object({
      zoneName: Joi.string().trim().optional().allow(''),
      gmtOffset: Joi.number().optional(),
      gmtOffsetName: Joi.string().trim().optional().allow(''),
      abbreviation: Joi.string().trim().optional().allow(''),
      tzName: Joi.string().trim().optional().allow('')
    }))
    .optional(),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get country by ID validation schema
const getCountryByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Country ID is required',
      'string.pattern.base': 'Please provide a valid country ID'
    })
});

// Get all countries query validation schema
const getAllCountriesSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('name', 'created_at', 'updated_at', 'country_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at, country_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCountrySchema,
  updateCountrySchema,
  getCountryByIdSchema,
  getAllCountriesSchema
};

