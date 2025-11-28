const Joi = require('joi');

const createMyFavoritesSchema = Joi.object({
  Item_id: Joi.number().integer().positive().required(),
  Status: Joi.boolean().optional().default(true)
});

const updateMyFavoritesSchema = Joi.object({
  Item_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getMyFavoritesByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllMyFavoritesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_Id: Joi.number().integer().positive().optional(),
  Item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'MyFavorites_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getMyFavoritesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'MyFavorites_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createMyFavoritesSchema,
  updateMyFavoritesSchema,
  getMyFavoritesByIdSchema,
  getAllMyFavoritesSchema,
  getMyFavoritesByAuthSchema
};
