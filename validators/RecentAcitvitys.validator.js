const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const createRecentAcitvitysSchema = Joi.object({
  Vender_store_id: Joi.number().integer().positive().required(),
  emozi: Joi.string().trim().max(50).optional().allow('', null),
  AcitivityText: Joi.string().trim().max(500).optional().allow('', null),
  Status: Joi.boolean().optional().default(true)
});

const updateRecentAcitvitysSchema = Joi.object({
  Vender_store_id: Joi.number().integer().positive().optional(),
  emozi: Joi.string().trim().max(50).optional().allow('', null),
  AcitivityText: Joi.string().trim().max(500).optional().allow('', null),
  Status: Joi.boolean().optional()
}).min(1);

const getRecentAcitvitysByIdSchema = Joi.object({
  id: idSchema
});

const getAllRecentAcitvitysSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Vender_store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'RecentAcitvitys_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getRecentAcitvitysByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Vender_store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'RecentAcitvitys_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createRecentAcitvitysSchema,
  updateRecentAcitvitysSchema,
  getRecentAcitvitysByIdSchema,
  getAllRecentAcitvitysSchema,
  getRecentAcitvitysByAuthSchema
};
