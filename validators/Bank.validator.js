const Joi = require('joi');

const createBankSchema = Joi.object({
  Bank_name: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Bank name must be a string',
      'string.empty': 'Bank name is required',
      'string.max': 'Bank name cannot exceed 200 characters',
      'any.required': 'Bank name is required'
    }),
  AccountNo: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({
      'string.base': 'Account number must be a string',
      'string.empty': 'Account number is required',
      'string.max': 'Account number cannot exceed 50 characters',
      'any.required': 'Account number is required'
    }),
  AccountType: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('', null),
  AccountHoladerName: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('', null),
  RoutingNo: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('', null),
  Branch: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('', null),
  User_Id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateBankSchema = Joi.object({
  Bank_name: Joi.string().trim().max(200).optional().allow('', null),
  AccountNo: Joi.string().trim().max(50).optional(),
  AccountType: Joi.string().trim().max(100).optional().allow('', null),
  AccountHoladerName: Joi.string().trim().max(200).optional().allow('', null),
  RoutingNo: Joi.string().trim().max(50).optional().allow('', null),
  Branch: Joi.string().trim().max(200).optional().allow('', null),
  User_Id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getBankByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Bank ID must be a valid ObjectId or positive number',
      'string.empty': 'Bank ID is required'
    })
});

const getAllBanksSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Bank_id', 'Bank_name').optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createBankSchema,
  updateBankSchema,
  getBankByIdSchema,
  getAllBanksSchema
};
