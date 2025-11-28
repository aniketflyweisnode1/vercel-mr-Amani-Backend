const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_item_Category_id: Joi.number().integer().positive().optional(),
  unit: Joi.string().trim().max(50).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'unitPrice', 'CurrentStock', 'Restaurant_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createRestaurantItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  Restaurant_item_Category_id: Joi.number().integer().positive().required(),
  CurrentStock: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  minStock: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).required(),
  SupplierName: Joi.string().trim().max(200).optional(),
  DeliveryTime: Joi.string().trim().max(50).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateRestaurantItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_item_Category_id: Joi.number().integer().positive().optional(),
  CurrentStock: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  minStock: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  SupplierName: Joi.string().trim().max(200).optional(),
  DeliveryTime: Joi.string().trim().max(50).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getRestaurantItemByIdSchema = Joi.object({
  id: idSchema
});

const getAllRestaurantItemsSchema = Joi.object(paginationBase);

const getRestaurantItemsByAuthSchema = Joi.object(paginationBase);

const getRestaurantItemsByCategoryParamsSchema = Joi.object({
  Restaurant_item_Category_id: Joi.number().integer().positive().required()
});

const getRestaurantItemsByCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'unitPrice', 'CurrentStock', 'Restaurant_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createRestaurantItemSchema,
  updateRestaurantItemSchema,
  getRestaurantItemByIdSchema,
  getAllRestaurantItemsSchema,
  getRestaurantItemsByAuthSchema,
  getRestaurantItemsByCategoryParamsSchema,
  getRestaurantItemsByCategoryQuerySchema
};


