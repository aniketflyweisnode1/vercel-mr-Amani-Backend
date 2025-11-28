const Joi = require('joi');

const createEffectsCategorysSchema = Joi.object({
  name: Joi.string().trim().max(200).required(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateEffectsCategorysSchema = Joi.object({
  name: Joi.string().trim().max(200).optional(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getEffectsCategorysByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllEffectsCategorysSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Effects_Categorys_id', 'name').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getEffectsCategorysByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Effects_Categorys_id', 'name').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createEffectsCategorysSchema,
  updateEffectsCategorysSchema,
  getEffectsCategorysByIdSchema,
  getAllEffectsCategorysSchema,
  getEffectsCategorysByAuthSchema
};

