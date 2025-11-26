const Joi = require('joi');

const createReportAnIssueSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number',
      'any.required': 'Branch ID is required'
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

const updateReportAnIssueSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
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

const getReportAnIssueByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Report an issue ID must be a valid ObjectId or positive number',
      'string.empty': 'Report an issue ID is required'
    })
});

const listQueryBase = {
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
    .optional()
    .allow('')
    .messages({
      'string.base': 'Search must be a string'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either "true" or "false"'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'ReportAnIssue_id', 'Branch_id', 'TypeIssue')
    .default('created_at')
    .messages({
      'any.only': 'SortBy must be one of: created_at, updated_at, ReportAnIssue_id, Branch_id, TypeIssue'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'SortOrder must be either "asc" or "desc"'
    })
};

const getAllReportAnIssueSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    }),
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Type issue must be a string'
    })
});

const getReportAnIssueByAuthSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    }),
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Type issue must be a string'
    })
});

const getReportAnIssueByTypeParamsSchema = Joi.object({
  TypeIssue: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Type issue is required',
      'any.required': 'Type issue is required'
    })
});

const getReportAnIssueByTypeQuerySchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    })
});

const getReportAnIssueByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number',
      'string.empty': 'Branch ID is required',
      'any.required': 'Branch ID is required'
    })
});

const getReportAnIssueByBranchIdQuerySchema = Joi.object({
  ...listQueryBase,
  TypeIssue: Joi.string()
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Type issue must be a string'
    })
});

module.exports = {
  createReportAnIssueSchema,
  updateReportAnIssueSchema,
  getReportAnIssueByIdSchema,
  getAllReportAnIssueSchema,
  getReportAnIssueByAuthSchema,
  getReportAnIssueByTypeParamsSchema,
  getReportAnIssueByTypeQuerySchema,
  getReportAnIssueByBranchIdParamsSchema,
  getReportAnIssueByBranchIdQuerySchema
};

