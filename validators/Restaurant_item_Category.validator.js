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
  sortBy: Joi.string().valid('CategoryName', 'created_at', 'updated_at', 'Restaurant_item_Category_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createRestaurantItemCategorySchema = Joi.object({
  CategoryName: Joi.string().trim().min(2).max(150).required(),
  Description: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateRestaurantItemCategorySchema = Joi.object({
  CategoryName: Joi.string().trim().min(2).max(150).optional(),
  Description: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getRestaurantItemCategoryByIdSchema = Joi.object({
  id: idSchema
});

const getAllRestaurantItemCategoriesSchema = Joi.object(paginationSchema);

const getRestaurantItemCategoriesByAuthSchema = Joi.object(paginationSchema);

const getRestaurantItemCategoryByTypeIdParamsSchema = Joi.object({
  Restaurant_item_Category_id: Joi.number().integer().positive().required()
});

module.exports = {
  createRestaurantItemCategorySchema,
  updateRestaurantItemCategorySchema,
  getRestaurantItemCategoryByIdSchema,
  getAllRestaurantItemCategoriesSchema,
  getRestaurantItemCategoriesByAuthSchema,
  getRestaurantItemCategoryByTypeIdParamsSchema
};


