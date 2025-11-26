const Joi = require('joi');

const createAdminPlanSubscriptionSchema = Joi.object({
  Admin_Plan_id: Joi.number().integer().positive().required(),
  Subscribe_By: Joi.number().integer().positive().required(),
  PlanExpiry_date: Joi.date().required(),
  PaymentStatus: Joi.string().valid('Pending', 'failed', 'success').optional().default('Pending'),
  Status: Joi.boolean().optional().default(true)
});

const updateAdminPlanSubscriptionSchema = Joi.object({
  Admin_Plan_id: Joi.number().integer().positive().optional(),
  Subscribe_By: Joi.number().integer().positive().optional(),
  PlanExpiry_date: Joi.date().optional(),
  PaymentStatus: Joi.string().valid('Pending', 'failed', 'success').optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getAdminPlanSubscriptionByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllAdminPlanSubscriptionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Admin_Plan_id: Joi.number().integer().positive().optional(),
  Subscribe_By: Joi.number().integer().positive().optional(),
  PaymentStatus: Joi.string().valid('Pending', 'failed', 'success').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Admin_Plan_Subscripiton_id', 'PlanExpiry_date').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getAdminPlanSubscriptionsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Admin_Plan_id: Joi.number().integer().positive().optional(),
  Subscribe_By: Joi.number().integer().positive().optional(),
  PaymentStatus: Joi.string().valid('Pending', 'failed', 'success').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Admin_Plan_Subscripiton_id', 'PlanExpiry_date').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getAdminPlanSubscriptionsByPlanIdParamsSchema = Joi.object({
  Admin_Plan_id: Joi.number().integer().positive().required()
});

const getAdminPlanSubscriptionsByPlanIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Subscribe_By: Joi.number().integer().positive().optional(),
  PaymentStatus: Joi.string().valid('Pending', 'failed', 'success').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Admin_Plan_Subscripiton_id', 'PlanExpiry_date').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createAdminPlanSubscriptionSchema,
  updateAdminPlanSubscriptionSchema,
  getAdminPlanSubscriptionByIdSchema,
  getAllAdminPlanSubscriptionsSchema,
  getAdminPlanSubscriptionsByAuthSchema,
  getAdminPlanSubscriptionsByPlanIdParamsSchema,
  getAdminPlanSubscriptionsByPlanIdQuerySchema
};

