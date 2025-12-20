const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const createOrderItemDeliveryStatusSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  Item_id: Joi.number().integer().positive().required(),
  DeliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional().default('Order Placed'),
  location: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateOrderItemDeliveryStatusSchema = Joi.object({
  order_id: Joi.number().integer().positive().optional(),
  Item_id: Joi.number().integer().positive().optional(),
  DeliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  location: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getOrderItemDeliveryStatusByIdSchema = Joi.object({
  id: idSchema
});

const getAllOrderItemDeliveryStatusSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0').optional()
  ).optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  order_id: Joi.number().integer().positive().optional(),
  Item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'orderItemDeliveryStatus_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderItemDeliveryStatusByOrderIdParamsSchema = Joi.object({
  order_id: Joi.number().integer().positive().required()
});

const getOrderItemDeliveryStatusByOrderIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'orderItemDeliveryStatus_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderItemDeliveryStatusByItemIdParamsSchema = Joi.object({
  Item_id: Joi.number().integer().positive().required()
});

const getOrderItemDeliveryStatusByItemIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'orderItemDeliveryStatus_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderItemDeliveryStatusByDeliveryStatusParamsSchema = Joi.object({
  DeliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').required()
});

const getOrderItemDeliveryStatusByDeliveryStatusQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  order_id: Joi.number().integer().positive().optional(),
  Item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'orderItemDeliveryStatus_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOrderItemDeliveryStatusByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0').optional()
  ).optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'orderItemDeliveryStatus_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createOrderItemDeliveryStatusSchema,
  updateOrderItemDeliveryStatusSchema,
  getOrderItemDeliveryStatusByIdSchema,
  getAllOrderItemDeliveryStatusSchema,
  getOrderItemDeliveryStatusByOrderIdParamsSchema,
  getOrderItemDeliveryStatusByOrderIdQuerySchema,
  getOrderItemDeliveryStatusByItemIdParamsSchema,
  getOrderItemDeliveryStatusByItemIdQuerySchema,
  getOrderItemDeliveryStatusByDeliveryStatusParamsSchema,
  getOrderItemDeliveryStatusByDeliveryStatusQuerySchema,
  getOrderItemDeliveryStatusByAuthSchema
};

