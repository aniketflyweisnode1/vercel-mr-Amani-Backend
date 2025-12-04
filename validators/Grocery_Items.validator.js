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
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  Grocery_Categories_id: Joi.number().integer().positive().optional(),
  category: Joi.number().integer().positive().optional(),
  Grocery_Categories_type_id: Joi.number().integer().positive().optional(),
  unit: Joi.string().trim().max(50).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'unitPrice', 'CurrentStock', 'Grocery_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createGroceryItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  Grocery_Categories_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().max(150).optional(),
  service_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  CurrentStock: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  minStock: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).required(),
  SupplierName: Joi.string().trim().max(200).optional(),
  DeliveryTime: Joi.string().trim().max(50).optional().allow(''),
  item_image: Joi.string().trim().max(500).optional().allow(''),
  Grocery_Categories_type_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateGroceryItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Grocery_Categories_id: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().max(150).optional(),
  service_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  CurrentStock: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  minStock: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  SupplierName: Joi.string().trim().max(200).optional(),
  DeliveryTime: Joi.string().trim().max(50).optional().allow(''),
  item_image: Joi.string().trim().max(500).optional().allow(''),
  Grocery_Categories_type_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getGroceryItemByIdSchema = Joi.object({
  id: idSchema
});

const getAllGroceryItemsSchema = Joi.object(paginationBase);

const getGroceryItemsByAuthSchema = Joi.object(paginationBase);

const getGroceryItemsByTypeIdParamsSchema = Joi.object({
  Grocery_Categories_type_id: Joi.number().integer().positive().required()
});

const getGroceryItemsByTypeIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'unitPrice', 'CurrentStock', 'Grocery_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getGroceryItemsByCategoryParamsSchema = Joi.object({
  Grocery_Categories_id: Joi.number().integer().positive().required()
});

const getGroceryItemsByCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'unitPrice', 'CurrentStock', 'Grocery_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createGroceryItemSchema,
  updateGroceryItemSchema,
  getGroceryItemByIdSchema,
  getAllGroceryItemsSchema,
  getGroceryItemsByAuthSchema,
  getGroceryItemsByTypeIdParamsSchema,
  getGroceryItemsByTypeIdQuerySchema,
  getGroceryItemsByCategoryParamsSchema,
  getGroceryItemsByCategoryQuerySchema
};

