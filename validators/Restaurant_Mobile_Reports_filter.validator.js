const Joi = require('joi');

const createReportsFilterSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  ReportsFor: Joi.string().trim().max(200).optional().allow(''),
  ReportsType: Joi.string().trim().max(200).optional().allow(''),
  StartDate: Joi.date().optional().allow(null),
  EndDate: Joi.date().optional().allow(null),
  DayofWeek: Joi.string().trim().max(50).optional().allow(''),
  providers: Joi.string().trim().max(200).optional().allow(''),
  BrackdownbyBrand: Joi.boolean().optional().default(false),
  BrackDownByBrand_Branches: Joi.string().trim().max(500).optional().allow(''),
  BrackownByBranches: Joi.boolean().optional().default(false),
  Status: Joi.boolean().optional().default(true)
});

const updateReportsFilterSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  ReportsFor: Joi.string().trim().max(200).optional().allow(''),
  ReportsType: Joi.string().trim().max(200).optional().allow(''),
  StartDate: Joi.date().optional().allow(null),
  EndDate: Joi.date().optional().allow(null),
  DayofWeek: Joi.string().trim().max(50).optional().allow(''),
  providers: Joi.string().trim().max(200).optional().allow(''),
  BrackdownbyBrand: Joi.boolean().optional(),
  BrackDownByBrand_Branches: Joi.string().trim().max(500).optional().allow(''),
  BrackownByBranches: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getReportsFilterByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllReportsFiltersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  ReportsFor: Joi.string().trim().max(200).optional(),
  ReportsType: Joi.string().trim().max(200).optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().optional(),
  DayofWeek: Joi.string().trim().max(50).optional(),
  providers: Joi.string().trim().max(200).optional(),
  BrackdownbyBrand: Joi.boolean().optional(),
  BrackownByBranches: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_Reports_id', 'StartDate', 'EndDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReportsFiltersByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  ReportsFor: Joi.string().trim().max(200).optional(),
  ReportsType: Joi.string().trim().max(200).optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().optional(),
  DayofWeek: Joi.string().trim().max(50).optional(),
  providers: Joi.string().trim().max(200).optional(),
  BrackdownbyBrand: Joi.boolean().optional(),
  BrackownByBranches: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_Reports_id', 'StartDate', 'EndDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getAllReportsFiltersByFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  ReportsFor: Joi.string().trim().max(200).optional(),
  ReportsType: Joi.string().trim().max(200).optional(),
  StartDate: Joi.date().optional(),
  EndDate: Joi.date().optional(),
  DayofWeek: Joi.string().trim().max(50).optional(),
  providers: Joi.string().trim().max(200).optional(),
  BrackdownbyBrand: Joi.boolean().optional(),
  BrackownByBranches: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_Reports_id', 'StartDate', 'EndDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createReportsFilterSchema,
  updateReportsFilterSchema,
  getReportsFilterByIdSchema,
  getAllReportsFiltersSchema,
  getReportsFiltersByAuthSchema,
  getAllReportsFiltersByFilterSchema
};

