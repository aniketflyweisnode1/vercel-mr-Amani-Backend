const Joi = require('joi');

/**
 * Get Business Dashboard Schema
 */
const getBusinessDashboardSchema = Joi.object({
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number',
      'any.required': 'Business branch ID is required'
    }),
  saleChartFilter: Joi.string()
    .valid('Today', 'Yesterday', 'LastSevenDay', 'LastMonthDays')
    .optional()
    .default('LastSevenDay')
    .messages({
      'any.only': 'Sale chart filter must be one of: Today, Yesterday, LastSevenDay, LastMonthDays'
    }),
  productMixFilter: Joi.string()
    .valid('LastSevenDay', 'LastMonthDays')
    .optional()
    .default('LastSevenDay')
    .messages({
      'any.only': 'Product mix filter must be one of: LastSevenDay, LastMonthDays'
    }),
  operationsFilter: Joi.string()
    .valid('LastSevenDay', 'LastMonthDays')
    .optional()
    .default('LastSevenDay')
    .messages({
      'any.only': 'Operations filter must be one of: LastSevenDay, LastMonthDays'
    }),
  salesReportDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Sales report date must be a valid date'
    }),
  salesReportFilter: Joi.string()
    .valid('day', 'week', 'monthly', 'threemonth', 'year')
    .optional()
    .default('monthly')
    .messages({
      'any.only': 'Sales report filter must be one of: day, week, monthly, threemonth, year'
    }),
  monthlyPerformanceFilter: Joi.string()
    .valid('today', 'week', 'month', 'alltime')
    .optional()
    .default('month')
    .messages({
      'any.only': 'Monthly performance filter must be one of: today, week, month, alltime'
    })
});

module.exports = {
  getBusinessDashboardSchema
};

