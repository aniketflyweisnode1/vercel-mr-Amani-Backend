const Joi = require('joi');

const getAccountingByIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'any.required': 'ID is required'
    })
});

const getAllAccountingSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
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
  filter: Joi.string()
    .valid('Today', 'ThisWeek', 'Month', 'all')
    .optional()
    .default('Month')
    .messages({
      'string.base': 'Filter must be a string',
      'any.only': 'Filter must be one of: Today, ThisWeek, Month, all'
    })
});

const deleteAccountingSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'string.base': 'ID must be a string',
      'string.empty': 'ID is required',
      'any.required': 'ID is required'
    })
});

const getAccountingByBranchIdParamsSchema = Joi.object({
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

const getAccountingByBranchIdQuerySchema = Joi.object({
  filter: Joi.string()
    .valid('Today', 'ThisWeek', 'Month', 'all')
    .optional()
    .default('Month')
    .messages({
      'string.base': 'Filter must be a string',
      'any.only': 'Filter must be one of: Today, ThisWeek, Month, all'
    })
});

const getAccountingByAuthSchema = Joi.object({
  filter: Joi.string()
    .valid('Today', 'ThisWeek', 'Month', 'all')
    .optional()
    .default('Month')
    .messages({
      'string.base': 'Filter must be a string',
      'any.only': 'Filter must be one of: Today, ThisWeek, Month, all'
    })
});

module.exports = {
  getAccountingByIdSchema,
  getAllAccountingSchema,
  deleteAccountingSchema,
  getAccountingByBranchIdParamsSchema,
  getAccountingByBranchIdQuerySchema,
  getAccountingByAuthSchema
};

