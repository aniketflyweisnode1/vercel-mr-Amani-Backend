const Joi = require('joi');

const createVendorBankSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  BankName: Joi.string().trim().max(200).required(),
  AccountNo: Joi.string().trim().max(50).required(),
  AccountType: Joi.string().valid('Savings', 'Current').default('Savings').optional(),
  AccountHolderName: Joi.string().trim().max(200).optional().allow(''),
  RoutingNo: Joi.string().trim().max(50).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorBankSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  BankName: Joi.string().trim().max(200).optional(),
  AccountNo: Joi.string().trim().max(50).optional(),
  AccountType: Joi.string().valid('Savings', 'Current').optional(),
  AccountHolderName: Joi.string().trim().max(200).optional().allow(''),
  RoutingNo: Joi.string().trim().max(50).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorBankByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorBanksSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Bank_id', 'BankName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorBanksByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Bank_id', 'BankName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorBankSchema,
  updateVendorBankSchema,
  getVendorBankByIdSchema,
  getAllVendorBanksSchema,
  getVendorBanksByAuthSchema
};

