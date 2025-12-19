const Joi = require('joi');

const createVendorProductDisputeSchema = Joi.object({
  order_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be a positive number',
      'any.required': 'Order ID is required'
    }),
  DisputeType: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'Dispute type must be a string',
      'string.empty': 'Dispute type cannot be empty',
      'string.min': 'Dispute type must be at least 2 characters long',
      'string.max': 'Dispute type cannot exceed 200 characters',
      'any.required': 'Dispute type is required'
    }),
  Description: Joi.string()
    .trim()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 5000 characters',
      'any.required': 'Description is required'
    }),
  imageScreenshot: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image screenshot URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateVendorProductDisputeSchema = Joi.object({
  order_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Order ID must be a number',
      'number.integer': 'Order ID must be an integer',
      'number.positive': 'Order ID must be a positive number'
    }),
  DisputeType: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Dispute type must be a string',
      'string.empty': 'Dispute type cannot be empty',
      'string.min': 'Dispute type must be at least 2 characters long',
      'string.max': 'Dispute type cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .min(10)
    .max(5000)
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  imageScreenshot: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image screenshot URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getVendorProductDisputeByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Vendor product dispute ID must be a valid ObjectId or positive number',
      'string.empty': 'Vendor product dispute ID is required'
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
  order_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow(''),
  DisputeType: Joi.string()
    .trim()
    .optional()
    .allow(''),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Vendor_Prdocut_Dispute_id', 'order_id', 'DisputeType')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
};

const getAllVendorProductDisputeSchema = Joi.object({
  ...listQueryBase
});

const getVendorProductDisputeByAuthSchema = Joi.object({
  ...listQueryBase
});

module.exports = {
  createVendorProductDisputeSchema,
  updateVendorProductDisputeSchema,
  getVendorProductDisputeByIdSchema,
  getAllVendorProductDisputeSchema,
  getVendorProductDisputeByAuthSchema
};

