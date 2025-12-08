const Joi = require('joi');

const createPrinterIssueSchema = Joi.object({
  Printer_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Printer ID must be a number',
      'number.integer': 'Printer ID must be an integer',
      'number.positive': 'Printer ID must be positive',
      'any.required': 'Printer ID is required'
    }),
  Printer_Issues: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Printer issues description is required',
      'string.min': 'Printer issues must be at least 1 character long',
      'string.max': 'Printer issues cannot exceed 500 characters',
      'any.required': 'Printer issues description is required'
    }),
  solveStatus: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'Solve status must be a boolean value'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updatePrinterIssueSchema = Joi.object({
  Printer_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Printer ID must be a number',
      'number.integer': 'Printer ID must be an integer',
      'number.positive': 'Printer ID must be positive'
    }),
  Printer_Issues: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Printer issues must be at least 1 character long',
      'string.max': 'Printer issues cannot exceed 500 characters'
    }),
  solveStatus: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Solve status must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getPrinterIssueByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Printer issue ID must be a valid ObjectId or positive number',
      'string.empty': 'Printer issue ID is required'
    })
});

const getAllPrinterIssuesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .optional()
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
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  solveStatus: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Printer_Issues_id', 'solveStatus')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createPrinterIssueSchema,
  updatePrinterIssueSchema,
  getPrinterIssueByIdSchema,
  getAllPrinterIssuesSchema
};
