const Joi = require('joi');

/**
 * Customer validation schemas using Joi
 */

// Create customer validation schema
const createCustomerSchema = Joi.object({
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
  FullName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 200 characters'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.empty': 'Branch ID is required',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  Customer_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Customer image must be a valid URL'
    }),
  Status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update customer validation schema
const updateCustomerSchema = Joi.object({
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  FullName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 200 characters'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  Customer_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Customer image must be a valid URL'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get customer by ID validation schema
const getCustomerByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
      Joi.string().pattern(/^\d+$/), // Number as string (e.g., "1", "2")
      Joi.number().integer().positive() // Number directly
    )
    .required()
    .messages({
      'alternatives.match': 'Customer ID must be a valid ObjectId or positive number',
      'string.empty': 'Customer ID is required'
    })
});

// Get all customers query validation schema
const getAllCustomersSchema = Joi.object({
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
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),
  sortBy: Joi.string()
    .valid('FullName', 'email', 'mobile', 'created_at', 'updated_at', 'Customer_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: FullName, email, mobile, created_at, updated_at, Customer_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Get customers by auth query validation schema
const getCustomersByAuthSchema = Joi.object({
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
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('FullName', 'email', 'mobile', 'created_at', 'updated_at', 'Customer_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: FullName, email, mobile, created_at, updated_at, Customer_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Get customers by service ID params validation schema
const getCustomersByServiceIdSchema = Joi.object({
  service_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.empty': 'Service ID is required',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    })
});

// Get customers by service ID query validation schema
const getCustomersByServiceIdQuerySchema = Joi.object({
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
    .valid('FullName', 'email', 'mobile', 'created_at', 'updated_at', 'Customer_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: FullName, email, mobile, created_at, updated_at, Customer_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Get customers by branch ID params validation schema
const getCustomersByBranchIdSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.empty': 'Branch ID is required',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    })
});

// Get customers by branch ID query validation schema
const getCustomersByBranchIdQuerySchema = Joi.object({
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
    .valid('FullName', 'email', 'mobile', 'created_at', 'updated_at', 'Customer_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: FullName, email, mobile, created_at, updated_at, Customer_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerByIdSchema,
  getAllCustomersSchema,
  getCustomersByAuthSchema,
  getCustomersByServiceIdSchema,
  getCustomersByServiceIdQuerySchema,
  getCustomersByBranchIdSchema,
  getCustomersByBranchIdQuerySchema
};

