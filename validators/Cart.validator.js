const Joi = require('joi');

const productSchema = Joi.object({
  Item_id: Joi.number().integer().positive().required(),
  Size: Joi.number().min(0).default(1).optional(),
  Quantity: Joi.number().integer().min(1).required(),
  Price: Joi.number().min(0).required(),
  DiscountPrice: Joi.number().min(0).default(0).optional()
});

const createCartSchema = Joi.object({
  Product: Joi.array().items(productSchema).min(1).required(),
  applyDiscount_id: Joi.number().integer().positive().optional().allow(null),
  service_id: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional().default(true)
});

const updateCartSchema = Joi.object({
  Product: Joi.array().items(productSchema).min(1).optional(),
  applyDiscount_id: Joi.number().integer().positive().optional().allow(null),
  service_id: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional()
}).min(1);

const getCartByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllCartsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_Id: Joi.number().integer().positive().optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Cart_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getCartsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Cart_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getCartsByDateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_Id: Joi.number().integer().positive().optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  date: Joi.date().required(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Cart_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createCartSchema,
  updateCartSchema,
  getCartByIdSchema,
  getAllCartsSchema,
  getCartsByAuthSchema,
  getCartsByDateQuerySchema
};

