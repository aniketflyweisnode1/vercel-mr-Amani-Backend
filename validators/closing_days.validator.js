const Joi = require('joi');

const createClosingDaysSchema = Joi.object({
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
  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  dayCount: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Day count must be a number',
      'number.integer': 'Day count must be an integer',
      'number.min': 'Day count cannot be negative',
      'any.required': 'Day count is required'
    }),
  dateFrom: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Date from must be a valid date',
      'date.format': 'Date from must be in ISO format',
      'any.required': 'Date from is required'
    }),
  datedTo: Joi.date()
    .iso()
    .min(Joi.ref('dateFrom'))
    .required()
    .messages({
      'date.base': 'Date to must be a valid date',
      'date.format': 'Date to must be in ISO format',
      'date.min': 'Date to must be after or equal to date from',
      'any.required': 'Date to is required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateClosingDaysSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  dayCount: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Day count must be a number',
      'number.integer': 'Day count must be an integer',
      'number.min': 'Day count cannot be negative'
    }),
  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date',
      'date.format': 'Date from must be in ISO format'
    }),
  datedTo: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date',
      'date.format': 'Date to must be in ISO format'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getClosingDaysByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Closing days ID must be a valid ObjectId or positive number',
      'string.empty': 'Closing days ID is required'
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
    .valid('created_at', 'updated_at', 'title', 'closing_days_id', 'Branch_id', 'dateFrom', 'datedTo', 'dayCount')
    .default('created_at')
    .messages({
      'any.only': 'SortBy must be one of: created_at, updated_at, title, closing_days_id, Branch_id, dateFrom, datedTo, dayCount'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'SortOrder must be either "asc" or "desc"'
    })
};

const getAllClosingDaysSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    }),
  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date',
      'date.format': 'Date from must be in ISO format'
    }),
  datedTo: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date',
      'date.format': 'Date to must be in ISO format'
    })
});

const getClosingDaysByAuthSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    }),
  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date',
      'date.format': 'Date from must be in ISO format'
    }),
  datedTo: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date',
      'date.format': 'Date to must be in ISO format'
    })
});

const getClosingDaysByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number',
      'string.empty': 'Branch ID is required',
      'any.required': 'Branch ID is required'
    })
});

const getClosingDaysByBranchIdQuerySchema = Joi.object({
  ...listQueryBase,
  dateFrom: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date',
      'date.format': 'Date from must be in ISO format'
    }),
  datedTo: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date',
      'date.format': 'Date to must be in ISO format'
    })
});

module.exports = {
  createClosingDaysSchema,
  updateClosingDaysSchema,
  getClosingDaysByIdSchema,
  getAllClosingDaysSchema,
  getClosingDaysByAuthSchema,
  getClosingDaysByBranchIdParamsSchema,
  getClosingDaysByBranchIdQuerySchema
};

