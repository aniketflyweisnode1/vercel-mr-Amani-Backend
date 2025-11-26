const Joi = require('joi');

const createContactSupportSchema = Joi.object({
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
  chat_supportNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Chat support number cannot exceed 50 characters'
    }),
  CallUsNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Call us number cannot exceed 50 characters'
    }),
  EmailSupport: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email support cannot exceed 200 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateContactSupportSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  chat_supportNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Chat support number cannot exceed 50 characters'
    }),
  CallUsNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Call us number cannot exceed 50 characters'
    }),
  EmailSupport: Joi.string()
    .email()
    .lowercase()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email support cannot exceed 200 characters'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getContactSupportByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Contact support ID must be a valid ObjectId or positive number',
      'string.empty': 'Contact support ID is required'
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
    .valid('created_at', 'updated_at', 'ContactSupport_id', 'Branch_id')
    .default('created_at')
    .messages({
      'any.only': 'SortBy must be one of: created_at, updated_at, ContactSupport_id, Branch_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'SortOrder must be either "asc" or "desc"'
    })
};

const getAllContactSupportSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    })
});

const getContactSupportByAuthSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    })
});

const getContactSupportByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number',
      'string.empty': 'Branch ID is required',
      'any.required': 'Branch ID is required'
    })
});

const getContactSupportByBranchIdQuerySchema = Joi.object({
  ...listQueryBase
});

module.exports = {
  createContactSupportSchema,
  updateContactSupportSchema,
  getContactSupportByIdSchema,
  getAllContactSupportSchema,
  getContactSupportByAuthSchema,
  getContactSupportByBranchIdParamsSchema,
  getContactSupportByBranchIdQuerySchema
};

