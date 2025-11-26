const Joi = require('joi');

const createExpenseSchema = Joi.object({
  Expense_Name: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Expense name must be a string',
      'string.empty': 'Expense name is required',
      'string.max': 'Expense name cannot exceed 200 characters',
      'any.required': 'Expense name is required'
    }),
  Amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative',
      'any.required': 'Amount is required'
    }),
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
  Date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in ISO format',
      'any.required': 'Date is required'
    }),
  Details: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Details cannot exceed 2000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateExpenseSchema = Joi.object({
  Expense_Name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Expense name cannot exceed 200 characters'
    }),
  Amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
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
  Date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Date must be a valid date',
      'date.format': 'Date must be in ISO format'
    }),
  Details: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Details cannot exceed 2000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getExpenseByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Expense ID must be a valid ObjectId or positive number',
      'any.required': 'Expense ID is required'
    })
});

const paginationQuery = {
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
    .allow('')
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
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
  minAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum amount must be a number',
      'number.min': 'Minimum amount cannot be negative'
    }),
  maxAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Maximum amount must be a number',
      'number.min': 'Maximum amount cannot be negative'
    }),
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format'
    }),
  endDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Date', 'Amount', 'Expense_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, Date, Amount, Expense_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
};

const getAllExpensesSchema = Joi.object({
  ...paginationQuery
});

const getExpensesByAuthSchema = Joi.object({
  ...paginationQuery
});

const getExpensesByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number',
      'any.required': 'Branch ID is required'
    })
});

const getExpensesByBranchIdQuerySchema = Joi.object({
  ...paginationQuery,
  Branch_id: Joi.forbidden()
}).messages({
  'any.unknown': 'Branch ID should be provided in the route parameter'
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseByIdSchema,
  getAllExpensesSchema,
  getExpensesByAuthSchema,
  getExpensesByBranchIdParamsSchema,
  getExpensesByBranchIdQuerySchema
};


