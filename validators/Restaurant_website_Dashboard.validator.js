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
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_website_Dashboard_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createWebsiteDashboardSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  AcitvewebSite: Joi.number().integer().min(0).optional(),
  InacitvewebSite: Joi.number().integer().min(0).optional(),
  MonthlyVisitoers: Joi.number().integer().min(0).optional(),
  TotalOrders: Joi.number().integer().min(0).optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateWebsiteDashboardSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  AcitvewebSite: Joi.number().integer().min(0).optional(),
  InacitvewebSite: Joi.number().integer().min(0).optional(),
  MonthlyVisitoers: Joi.number().integer().min(0).optional(),
  TotalOrders: Joi.number().integer().min(0).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getWebsiteDashboardByIdSchema = Joi.object({
  id: idSchema
});

const getAllWebsiteDashboardsSchema = Joi.object(paginationSchema);

module.exports = {
  createWebsiteDashboardSchema,
  updateWebsiteDashboardSchema,
  getWebsiteDashboardByIdSchema,
  getAllWebsiteDashboardsSchema
};


