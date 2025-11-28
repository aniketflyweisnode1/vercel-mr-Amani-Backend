const Joi = require('joi');

const createEffectsSchema = Joi.object({
  Effects_Categorys_id: Joi.number().integer().positive().required(),
  image: Joi.string().trim().max(500).optional().allow(''),
  video: Joi.string().trim().max(500).optional().allow(''),
  name: Joi.string().trim().max(200).required(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateEffectsSchema = Joi.object({
  Effects_Categorys_id: Joi.number().integer().positive().optional(),
  image: Joi.string().trim().max(500).optional().allow(''),
  video: Joi.string().trim().max(500).optional().allow(''),
  name: Joi.string().trim().max(200).optional(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getEffectsByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllEffectsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Effects_Categorys_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Effects_id', 'name').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getEffectsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Effects_Categorys_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Effects_id', 'name').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getEffectsByCategoryIdParamsSchema = Joi.object({
  Effects_Categorys_id: Joi.number().integer().positive().required()
});

const getEffectsByCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Effects_id', 'name').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createEffectsSchema,
  updateEffectsSchema,
  getEffectsByIdSchema,
  getAllEffectsSchema,
  getEffectsByAuthSchema,
  getEffectsByCategoryIdParamsSchema,
  getEffectsByCategoryIdQuerySchema
};

