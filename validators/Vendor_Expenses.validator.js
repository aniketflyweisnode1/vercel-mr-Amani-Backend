const Joi = require('joi');

const createVendorExpensesSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  ExpenseName: Joi.string().trim().max(200).required(),
  Amount: Joi.number().min(0).required(),
  Category_id: Joi.number().integer().positive().required(),
  Date: Joi.date().required(),
  Details: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorExpensesSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  ExpenseName: Joi.string().trim().max(200).optional(),
  Amount: Joi.number().min(0).optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Date: Joi.date().optional(),
  Details: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorExpensesByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorExpensesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Expenses_id', 'Date', 'Amount', 'ExpenseName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorExpensesByTypeIdParamsSchema = Joi.object({
  Type_id: Joi.number().integer().positive().required()
});

const getVendorExpensesByTypeIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Expenses_id', 'Date', 'Amount', 'ExpenseName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorExpensesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Expenses_id', 'Date', 'Amount', 'ExpenseName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorExpensesByCategoryIdParamsSchema = Joi.object({
  Category_id: Joi.number().integer().positive().required()
});

const getVendorExpensesByCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Expenses_id', 'Date', 'Amount', 'ExpenseName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorExpensesByDateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  date: Joi.date().required(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Expenses_id', 'Date', 'Amount', 'ExpenseName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorExpensesSchema,
  updateVendorExpensesSchema,
  getVendorExpensesByIdSchema,
  getAllVendorExpensesSchema,
  getVendorExpensesByTypeIdParamsSchema,
  getVendorExpensesByTypeIdQuerySchema,
  getVendorExpensesByAuthSchema,
  getVendorExpensesByCategoryIdParamsSchema,
  getVendorExpensesByCategoryIdQuerySchema,
  getVendorExpensesByDateQuerySchema
};

