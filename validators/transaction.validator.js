const Joi = require('joi');

const createTransactionSchema = Joi.object({
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative',
      'any.required': 'Amount is required'
    }),
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'requires_payment_method')
    .optional()
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, completed, failed, requires_payment_method'
    }),
  payment_method_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment method ID must be a number',
      'number.integer': 'Payment method ID must be an integer',
      'number.positive': 'Payment method ID must be a positive number',
      'any.required': 'Payment method ID is required'
    }),
  transactionType: Joi.string()
    .valid('Registration_fee', 'deposit', 'withdraw', 'Plan_Buy', 'Recharge', 'refund')
    .required()
    .messages({
      'any.only': 'Transaction type must be one of: Registration_fee, deposit, withdraw, Plan_Buy, Recharge, refund',
      'any.required': 'Transaction type is required'
    }),
  transaction_date: Joi.date()
    .optional()
    .default(Date.now),
  reference_number: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Reference number cannot exceed 100 characters'
    }),
  coupon_code_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  CGST: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'CGST must be a number',
      'number.min': 'CGST cannot be negative'
    }),
  SGST: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'SGST must be a number',
      'number.min': 'SGST cannot be negative'
    }),
  TotalGST: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Total GST must be a number',
      'number.min': 'Total GST cannot be negative'
    }),
  metadata: Joi.string()
    .trim()
    .optional()
    .allow(null, ''),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  bank_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  bank_branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  isDownloaded: Joi.boolean()
    .optional()
    .default(false),
  fileDownlodedPath: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'File download path cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateTransactionSchema = Joi.object({
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  amount: Joi.number()
    .min(0)
    .optional(),
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'requires_payment_method')
    .optional(),
  payment_method_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  transactionType: Joi.string()
    .valid('Registration_fee', 'deposit', 'withdraw', 'Plan_Buy', 'Recharge', 'refund')
    .optional(),
  transaction_date: Joi.date()
    .optional(),
  reference_number: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(''),
  coupon_code_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  CGST: Joi.number()
    .min(0)
    .optional(),
  SGST: Joi.number()
    .min(0)
    .optional(),
  TotalGST: Joi.number()
    .min(0)
    .optional(),
  metadata: Joi.string()
    .trim()
    .optional()
    .allow(null, ''),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  bank_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  bank_branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null),
  isDownloaded: Joi.boolean()
    .optional(),
  fileDownlodedPath: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, ''),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getTransactionByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Transaction ID must be a valid ObjectId or positive number',
      'string.empty': 'Transaction ID is required'
    })
});

const getAllTransactionsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'requires_payment_method')
    .optional(),
  transactionType: Joi.string()
    .valid('Registration_fee', 'deposit', 'withdraw', 'Plan_Buy', 'Recharge', 'refund')
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  Status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'transaction_date', 'amount')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getTransactionsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('pending', 'completed', 'failed', 'requires_payment_method')
    .optional(),
  transactionType: Joi.string()
    .valid('Registration_fee', 'deposit', 'withdraw', 'Plan_Buy', 'Recharge', 'refund')
    .optional(),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  Status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'transaction_date', 'amount')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionByIdSchema,
  getAllTransactionsSchema,
  getTransactionsByAuthSchema
};

