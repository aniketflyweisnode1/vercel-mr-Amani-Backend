const Joi = require('joi');

const createWorkingHoursSchema = Joi.object({
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
  Days: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .required()
    .messages({
      'array.base': 'Days must be an array',
      'array.min': 'At least one day is required',
      'any.required': 'Days array is required'
    }),
  time_from: Joi.string()
    .trim()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': 'Time from must be a string',
      'string.empty': 'Time from cannot be empty',
      'string.pattern.base': 'Time from must be in HH:MM format (24-hour)',
      'any.required': 'Time from is required'
    }),
  time_to: Joi.string()
    .trim()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.base': 'Time to must be a string',
      'string.empty': 'Time to cannot be empty',
      'string.pattern.base': 'Time to must be in HH:MM format (24-hour)',
      'any.required': 'Time to is required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateWorkingHoursSchema = Joi.object({
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
  Days: Joi.array()
    .items(Joi.string().trim().min(1))
    .min(1)
    .optional()
    .messages({
      'array.base': 'Days must be an array',
      'array.min': 'At least one day is required'
    }),
  time_from: Joi.string()
    .trim()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.base': 'Time from must be a string',
      'string.empty': 'Time from cannot be empty',
      'string.pattern.base': 'Time from must be in HH:MM format (24-hour)'
    }),
  time_to: Joi.string()
    .trim()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.base': 'Time to must be a string',
      'string.empty': 'Time to cannot be empty',
      'string.pattern.base': 'Time to must be in HH:MM format (24-hour)'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getWorkingHoursByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Working hours ID must be a valid ObjectId or positive number',
      'string.empty': 'Working hours ID is required'
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
    .valid('created_at', 'updated_at', 'title', 'Working_Hours_id', 'Branch_id')
    .default('created_at')
    .messages({
      'any.only': 'SortBy must be one of: created_at, updated_at, title, Working_Hours_id, Branch_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'SortOrder must be either "asc" or "desc"'
    })
};

const getAllWorkingHoursSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    })
});

const getWorkingHoursByAuthSchema = Joi.object({
  ...listQueryBase,
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number'
    })
});

const getWorkingHoursByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'Branch ID must be a positive number',
      'string.empty': 'Branch ID is required',
      'any.required': 'Branch ID is required'
    })
});

const getWorkingHoursByBranchIdQuerySchema = Joi.object({
  ...listQueryBase
});

module.exports = {
  createWorkingHoursSchema,
  updateWorkingHoursSchema,
  getWorkingHoursByIdSchema,
  getAllWorkingHoursSchema,
  getWorkingHoursByAuthSchema,
  getWorkingHoursByBranchIdParamsSchema,
  getWorkingHoursByBranchIdQuerySchema
};

