const Joi = require('joi');

const createRestaurantItemRequestSchema = Joi.object({
  item_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Item ID must be a number',
      'number.positive': 'Item ID must be a positive number',
      'any.required': 'Item ID is required'
    }),
  Supplier_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Supplier ID must be a number',
      'number.positive': 'Supplier ID must be a positive number',
      'any.required': 'Supplier ID is required'
    }),
  RequiredStock: Joi.number().min(0).required()
    .messages({
      'number.base': 'Required stock must be a number',
      'number.min': 'Required stock cannot be negative',
      'any.required': 'Required stock is required'
    }),
  Unit: Joi.string().trim().max(50).allow('', null).optional(),
  Price: Joi.number().min(0).required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  DeliveryPeriod: Joi.string().valid('Daily', 'Weekly', 'Monthly').default('Daily'),
  Status: Joi.boolean().default(true)
});

const updateRestaurantItemRequestSchema = Joi.object({
  item_id: Joi.number().integer().positive().optional(),
  Supplier_id: Joi.number().integer().positive().optional(),
  RequiredStock: Joi.number().min(0).optional(),
  Unit: Joi.string().trim().max(50).allow('', null).optional(),
  Price: Joi.number().min(0).optional(),
  DeliveryPeriod: Joi.string().valid('Daily', 'Weekly', 'Monthly').optional(),
  Status: Joi.boolean().optional()
});

const getRestaurantItemRequestByIdSchema = Joi.object({
  id: Joi.string().required()
    .messages({
      'string.empty': 'Restaurant item request ID is required',
      'any.required': 'Restaurant item request ID is required'
    })
});

const getAllRestaurantItemRequestsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  item_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  Supplier_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  DeliveryPeriod: Joi.string().valid('Daily', 'Weekly', 'Monthly').optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

const getRestaurantItemRequestsBySupplierParamsSchema = Joi.object({
  Supplier_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).required()
    .messages({
      'any.required': 'Supplier ID is required'
    })
});

const getRestaurantItemRequestsBySupplierQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  item_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  DeliveryPeriod: Joi.string().valid('Daily', 'Weekly', 'Monthly').optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

const getRestaurantItemRequestsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  item_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  Supplier_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  DeliveryPeriod: Joi.string().valid('Daily', 'Weekly', 'Monthly').optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

module.exports = {
  createRestaurantItemRequestSchema,
  updateRestaurantItemRequestSchema,
  getRestaurantItemRequestByIdSchema,
  getAllRestaurantItemRequestsSchema,
  getRestaurantItemRequestsBySupplierParamsSchema,
  getRestaurantItemRequestsBySupplierQuerySchema,
  getRestaurantItemRequestsByAuthSchema
};
