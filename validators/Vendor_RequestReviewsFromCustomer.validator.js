const Joi = require('joi');

const createVendorRequestReviewsFromCustomerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Name cannot exceed 200 characters'
    }),
  country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  phoneno: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 200 characters'
    }),
  budget: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Budget must be a number',
      'number.min': 'Budget cannot be negative'
    }),
  Description: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateVendorRequestReviewsFromCustomerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Name cannot exceed 200 characters'
    }),
  country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  phoneno: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters'
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 200 characters'
    }),
  budget: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Budget must be a number',
      'number.min': 'Budget cannot be negative'
    }),
  Description: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getVendorRequestReviewsFromCustomerByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Vendor request reviews from customer ID must be a valid ObjectId or positive number',
      'string.empty': 'Vendor request reviews from customer ID is required'
    })
});

const listQueryBase = {
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
  country_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow(''),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Vendor_RequestReviewsFromCustomer_id', 'name', 'email')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
};

const getAllVendorRequestReviewsFromCustomerSchema = Joi.object({
  ...listQueryBase
});

const getVendorRequestReviewsFromCustomerByAuthSchema = Joi.object({
  ...listQueryBase
});

module.exports = {
  createVendorRequestReviewsFromCustomerSchema,
  updateVendorRequestReviewsFromCustomerSchema,
  getVendorRequestReviewsFromCustomerByIdSchema,
  getAllVendorRequestReviewsFromCustomerSchema,
  getVendorRequestReviewsFromCustomerByAuthSchema
};

