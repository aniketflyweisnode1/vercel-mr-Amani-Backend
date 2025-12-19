const Joi = require('joi');

const productImageDetailSchema = Joi.object({
  Image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image URL cannot exceed 500 characters'
    }),
  Details: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Details cannot exceed 2000 characters'
    })
});

const createVendorReviewsFormConttentCreatorSchema = Joi.object({
  ConttentCreators: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({
      'array.base': 'Content creators must be an array'
    }),
  PrdocutImageDetails: Joi.array()
    .items(productImageDetailSchema)
    .optional()
    .default([])
    .messages({
      'array.base': 'Product image details must be an array'
    }),
  Payment_Options: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
    .messages({
      'array.base': 'Payment options must be an array',
      'number.base': 'Each payment option must be a number',
      'number.integer': 'Each payment option must be an integer',
      'number.positive': 'Each payment option must be a positive number'
    }),
  linkAccountURL: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Link account URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateVendorReviewsFormConttentCreatorSchema = Joi.object({
  ConttentCreators: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({
      'array.base': 'Content creators must be an array'
    }),
  PrdocutImageDetails: Joi.array()
    .items(productImageDetailSchema)
    .optional()
    .messages({
      'array.base': 'Product image details must be an array'
    }),
  Payment_Options: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Payment options must be an array',
      'number.base': 'Each payment option must be a number',
      'number.integer': 'Each payment option must be an integer',
      'number.positive': 'Each payment option must be a positive number'
    }),
  linkAccountURL: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Link account URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getVendorReviewsFormConttentCreatorByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Vendor reviews form content creator ID must be a valid ObjectId or positive number',
      'string.empty': 'Vendor reviews form content creator ID is required'
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
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Vendor_ReviewsFormConttentCreator_id')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
};

const getAllVendorReviewsFormConttentCreatorSchema = Joi.object({
  ...listQueryBase
});

const getVendorReviewsFormConttentCreatorByAuthSchema = Joi.object({
  ...listQueryBase
});

module.exports = {
  createVendorReviewsFormConttentCreatorSchema,
  updateVendorReviewsFormConttentCreatorSchema,
  getVendorReviewsFormConttentCreatorByIdSchema,
  getAllVendorReviewsFormConttentCreatorSchema,
  getVendorReviewsFormConttentCreatorByAuthSchema
};

