const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const createDeliverySchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  DeliveryDay: Joi.date().required(),
  DeliveryLastTime: Joi.string().trim().max(50).optional().allow(''),
  ReceivedPersonName: Joi.string().trim().max(200).optional().allow(''),
  DliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional().allow(''),
  DliveryPersonName: Joi.string().trim().max(200).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateDeliverySchema = Joi.object({
  order_id: Joi.number().integer().positive().optional(),
  DeliveryDay: Joi.date().optional(),
  DeliveryLastTime: Joi.string().trim().max(50).optional().allow(''),
  ReceivedPersonName: Joi.string().trim().max(200).optional().allow(''),
  DliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional().allow(''),
  DliveryPersonName: Joi.string().trim().max(200).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getDeliveryByIdSchema = Joi.object({
  id: idSchema
});

const getAllDeliveriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0').optional()
  ).optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  order_id: Joi.number().integer().positive().optional(),
  startDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate().optional()
  ).optional(),
  endDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate().optional()
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Delivery_id', 'DeliveryDay').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDeliveriesByOrderIdParamsSchema = Joi.object({
  order_id: Joi.number().integer().positive().required()
});

const getDeliveriesByOrderIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Delivery_id', 'DeliveryDay').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDeliveriesByItemParamsSchema = Joi.object({
  item_id: Joi.number().integer().positive().required()
});

const getDeliveriesByItemQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Delivery_id', 'DeliveryDay').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDeliveriesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0').optional()
  ).optional(),
  deliveryStatus: Joi.string().valid('Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered').optional(),
  startDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate().optional()
  ).optional(),
  endDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate().optional()
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Delivery_id', 'DeliveryDay').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDeliverySchema,
  updateDeliverySchema,
  getDeliveryByIdSchema,
  getAllDeliveriesSchema,
  getDeliveriesByOrderIdParamsSchema,
  getDeliveriesByOrderIdQuerySchema,
  getDeliveriesByItemParamsSchema,
  getDeliveriesByItemQuerySchema,
  getDeliveriesByAuthSchema
};

