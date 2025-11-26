const Joi = require('joi');

const createMobileAppSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(),
  WantMobileApp: Joi.boolean().optional().default(false),
  Notificcation: Joi.boolean().optional().default(false),
  Stock_notify_Notficaiton: Joi.boolean().optional().default(false),
  Stock_notify_Email: Joi.boolean().optional().default(false),
  Stock_notify_Phone: Joi.boolean().optional().default(false),
  Country_id: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional().default(true)
});

const updateMobileAppSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  user_id: Joi.number().integer().positive().optional(),
  WantMobileApp: Joi.boolean().optional(),
  Notificcation: Joi.boolean().optional(),
  Stock_notify_Notficaiton: Joi.boolean().optional(),
  Stock_notify_Email: Joi.boolean().optional(),
  Stock_notify_Phone: Joi.boolean().optional(),
  Country_id: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional()
}).min(1);

const getMobileAppByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllMobileAppsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Country_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_app_id', 'WantMobileApp').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getMobileAppsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  Country_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_app_id', 'WantMobileApp').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getMobileAppsByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getMobileAppsByBranchQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Mobile_app_id', 'WantMobileApp').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createMobileAppSchema,
  updateMobileAppSchema,
  getMobileAppByIdSchema,
  getAllMobileAppsSchema,
  getMobileAppsByAuthSchema,
  getMobileAppsByBranchParamsSchema,
  getMobileAppsByBranchQuerySchema
};

