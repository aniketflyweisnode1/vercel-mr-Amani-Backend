const Joi = require('joi');

const getFinanceByBranchIdParamsSchema = Joi.object({
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

const financeQuerySchema = Joi.object({
  transactionSortBy: Joi.string()
    .valid('transaction_date', 'created_at', 'updated_at', 'amount')
    .default('transaction_date')
    .messages({
      'any.only': 'Transaction sortBy must be one of: transaction_date, created_at, updated_at, amount'
    }),
  transactionSortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Transaction sort order must be asc or desc'
    }),
  expenseSortBy: Joi.string()
    .valid('Date', 'created_at', 'updated_at', 'Amount')
    .default('Date')
    .messages({
      'any.only': 'Expense sortBy must be one of: Date, created_at, updated_at, Amount'
    }),
  expenseSortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Expense sort order must be asc or desc'
    })
});

module.exports = {
  getFinanceByBranchIdParamsSchema,
  financeQuerySchema
};


