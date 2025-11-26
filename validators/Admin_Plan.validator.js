const Joi = require('joi');

const planFacilitySchema = Joi.object({
  line: Joi.string().trim().max(500).optional().allow(''),
  apply: Joi.boolean().optional().default(false)
});

const createAdminPlanSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().max(200).required(),
  fee: Joi.number().min(0).required(),
  duration: Joi.number().integer().min(1).required(),
  Plan_facility: Joi.array().items(planFacilitySchema).optional().default([]),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateAdminPlanSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().max(200).optional(),
  fee: Joi.number().min(0).optional(),
  duration: Joi.number().integer().min(1).optional(),
  Plan_facility: Joi.array().items(planFacilitySchema).optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getAdminPlanByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllAdminPlansSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Admin_Plan_id', 'name', 'fee', 'duration').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getAdminPlansByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Admin_Plan_id', 'name', 'fee', 'duration').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createAdminPlanSchema,
  updateAdminPlanSchema,
  getAdminPlanByIdSchema,
  getAllAdminPlansSchema,
  getAdminPlansByAuthSchema
};

