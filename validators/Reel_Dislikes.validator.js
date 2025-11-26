const Joi = require('joi');

const createReelDislikesSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().required(),
  DislikesBy: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateReelDislikesSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().optional(),
  DislikesBy: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getReelDislikesByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllReelDislikesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Real_Post_id: Joi.number().integer().positive().optional(),
  DislikesBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Dislikes_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReelDislikesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Real_Post_id: Joi.number().integer().positive().optional(),
  DislikesBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Dislikes_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReelDislikesByReelIdParamsSchema = Joi.object({
  reelId: Joi.number().integer().positive().required()
});

const getReelDislikesByReelIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  DislikesBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Dislikes_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createReelDislikesSchema,
  updateReelDislikesSchema,
  getReelDislikesByIdSchema,
  getAllReelDislikesSchema,
  getReelDislikesByAuthSchema,
  getReelDislikesByReelIdParamsSchema,
  getReelDislikesByReelIdQuerySchema
};

