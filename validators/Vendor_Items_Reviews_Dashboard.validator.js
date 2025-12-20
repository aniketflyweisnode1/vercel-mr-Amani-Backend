const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Items_Reviews_Dashboard_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createDashboardSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required(),
  OverallRating: Joi.number().min(0).max(5).optional(),
  ExcellentCount: Joi.number().integer().min(0).optional(),
  GoodCount: Joi.number().integer().min(0).optional(),
  AverageCount: Joi.number().integer().min(0).optional(),
  PoorCount: Joi.number().integer().min(0).optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateDashboardSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  OverallRating: Joi.number().min(0).max(5).optional(),
  ExcellentCount: Joi.number().integer().min(0).optional(),
  GoodCount: Joi.number().integer().min(0).optional(),
  AverageCount: Joi.number().integer().min(0).optional(),
  PoorCount: Joi.number().integer().min(0).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getDashboardByIdSchema = Joi.object({
  id: idSchema
});

const getAllDashboardsSchema = Joi.object(paginationSchema);

const getDashboardsByAuthSchema = Joi.object(paginationSchema);

const getDashboardByStoreParamsSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required()
});

const getDashboardByStoreQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  createDashboardSchema,
  updateDashboardSchema,
  getDashboardByIdSchema,
  getAllDashboardsSchema,
  getDashboardsByAuthSchema,
  getDashboardByStoreParamsSchema,
  getDashboardByStoreQuerySchema
};

