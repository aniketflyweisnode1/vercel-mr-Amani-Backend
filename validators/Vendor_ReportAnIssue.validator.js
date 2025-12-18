const Joi = require('joi');

const createVendorReportAnIssueSchema = Joi.object({
  Vendor_Store_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor store ID must be a number',
      'number.integer': 'Vendor store ID must be an integer',
      'number.positive': 'Vendor store ID must be a positive number',
      'any.required': 'Vendor store ID is required'
    }),
  TypeIssue: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'Type issue must be a string',
      'string.empty': 'Type issue cannot be empty',
      'string.min': 'Type issue must be at least 2 characters long',
      'string.max': 'Type issue cannot exceed 200 characters',
      'any.required': 'Type issue is required'
    }),
  Description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
  ScreenShot: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Screen shot URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateVendorReportAnIssueSchema = Joi.object({
  Vendor_Store_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor store ID must be a number',
      'number.integer': 'Vendor store ID must be an integer',
      'number.positive': 'Vendor store ID must be a positive number'
    }),
  TypeIssue: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Type issue must be a string',
      'string.empty': 'Type issue cannot be empty',
      'string.min': 'Type issue must be at least 2 characters long',
      'string.max': 'Type issue cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  ScreenShot: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Screen shot URL cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getVendorReportAnIssueByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Vendor report an issue ID must be a valid ObjectId or positive number',
      'string.empty': 'Vendor report an issue ID is required'
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
    .valid('created_at', 'updated_at', 'Vendor_ReportAnIssue_id', 'Vendor_Store_id', 'TypeIssue')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
};

const getAllVendorReportAnIssueSchema = Joi.object({
  ...listQueryBase,
  Vendor_Store_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow(''),
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
});

const getVendorReportAnIssueByAuthSchema = Joi.object({
  ...listQueryBase,
  Vendor_Store_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow(''),
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
});

const getVendorReportAnIssueByTypeParamsSchema = Joi.object({
  TypeIssue: Joi.string()
    .trim()
    .min(1)
    .required()
});

const getVendorReportAnIssueByTypeQuerySchema = Joi.object({
  ...listQueryBase,
  Vendor_Store_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
});

const getVendorReportAnIssueByStoreIdParamsSchema = Joi.object({
  Vendor_Store_id: Joi.string()
    .pattern(/^\d+$/)
    .required()
});

const getVendorReportAnIssueByStoreIdQuerySchema = Joi.object({
  ...listQueryBase,
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
});

module.exports = {
  createVendorReportAnIssueSchema,
  updateVendorReportAnIssueSchema,
  getVendorReportAnIssueByIdSchema,
  getAllVendorReportAnIssueSchema,
  getVendorReportAnIssueByAuthSchema,
  getVendorReportAnIssueByTypeParamsSchema,
  getVendorReportAnIssueByTypeQuerySchema,
  getVendorReportAnIssueByStoreIdParamsSchema,
  getVendorReportAnIssueByStoreIdQuerySchema
};


