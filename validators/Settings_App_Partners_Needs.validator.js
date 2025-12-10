const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const needsAppSchema = Joi.object({
  Name: Joi.string().trim().max(200).optional().allow('', null),
  Image: Joi.string().trim().max(500).optional().allow('', null),
  Status: Joi.boolean().optional().default(false)
});

const createSettingsAppPartnersNeedsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().required(),
  Needs_App: Joi.array().items(needsAppSchema).optional().default([]),
  Status: Joi.boolean().optional().default(true)
});

const updateSettingsAppPartnersNeedsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().optional(),
  Needs_App: Joi.array().items(needsAppSchema).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getSettingsAppPartnersNeedsByIdSchema = Joi.object({
  id: idSchema
});

const getAllSettingsAppPartnersNeedsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Settings_App_Partners_Needs_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getSettingsAppPartnersNeedsByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().required()
});

const getSettingsAppPartnersNeedsByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Settings_App_Partners_Needs_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getSettingsAppPartnersNeedsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Settings_App_Partners_Needs_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createSettingsAppPartnersNeedsSchema,
  updateSettingsAppPartnersNeedsSchema,
  getSettingsAppPartnersNeedsByIdSchema,
  getAllSettingsAppPartnersNeedsSchema,
  getSettingsAppPartnersNeedsByBranchIdParamsSchema,
  getSettingsAppPartnersNeedsByBranchIdQuerySchema,
  getSettingsAppPartnersNeedsByAuthSchema
};
