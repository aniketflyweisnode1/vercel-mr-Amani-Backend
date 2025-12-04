const Joi = require('joi');

const productSchema = Joi.object({
  Item_id: Joi.number().integer().positive().required(),
  Size: Joi.number().min(0).default(1).optional(),
  Quantity: Joi.number().integer().min(1).required(),
  Price: Joi.number().min(0).required(),
  DiscountPrice: Joi.number().min(0).default(0).optional()
});

const createOrderNowSchema = Joi.object({
  Product: Joi.array().items(productSchema).min(1).optional(), // Optional - will use cart if not provided
  applyDiscount_id: Joi.number().integer().positive().optional().allow(null),
  service_id: Joi.number().integer().positive().optional().allow(null),
  payment_method_id: Joi.number().integer().positive().required(),
  paymentStatus: Joi.string().trim().max(100).optional().allow(''),
  Delivery_address_id: Joi.number().integer().positive().optional().allow(null),
  OrderStatus: Joi.string().valid('Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return').default('Pending').optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateOrderNowSchema = Joi.object({
  Product: Joi.array().items(productSchema).min(1).optional(),
  applyDiscount_id: Joi.number().integer().positive().optional().allow(null),
  service_id: Joi.number().integer().positive().optional().allow(null),
  Order: Joi.string().valid('Picup', 'Delivery').optional(),
  payment_method_id: Joi.number().integer().positive().optional(),
  paymentStatus: Joi.string().trim().max(100).optional().allow(''),
  Delivery_address_id: Joi.number().integer().positive().optional().allow(null),
  Trangection_Id: Joi.number().integer().positive().optional().allow(null),
  OrderStatus: Joi.string().valid('Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return').optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getOrderNowByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllOrderNowsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_Id: Joi.number().integer().positive().optional(),
  Order: Joi.string().valid('Picup', 'Delivery').optional(),
  OrderStatus: Joi.string().valid('Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return').optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  payment_method_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Order_Now_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderNowsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Order: Joi.string().valid('Picup', 'Delivery').optional(),
  OrderStatus: Joi.string().valid('Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return').optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  payment_method_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Order_Now_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderNowsByDateQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_Id: Joi.number().integer().positive().optional(),
  Order: Joi.string().valid('Picup', 'Delivery').optional(),
  OrderStatus: Joi.string().valid('Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return').optional(),
  applyDiscount_id: Joi.number().integer().positive().optional(),
  service_id: Joi.number().integer().positive().optional(),
  payment_method_id: Joi.number().integer().positive().optional(),
  date: Joi.date().required(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Order_Now_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const processPaymentSchema = Joi.object({
  order_id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required(),
  payment_method_id: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
  reference_number: Joi.string().trim().max(100).optional().allow(null, ''),
  metadata: Joi.string().trim().optional().allow(null, '')
});

module.exports = {
  createOrderNowSchema,
  updateOrderNowSchema,
  getOrderNowByIdSchema,
  getAllOrderNowsSchema,
  getOrderNowsByAuthSchema,
  getOrderNowsByDateQuerySchema,
  processPaymentSchema
};

