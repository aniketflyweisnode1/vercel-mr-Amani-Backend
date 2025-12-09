const Joi = require('joi');

const pickUpSchema = Joi.object({
  AutoPuckup: Joi.boolean().default(false),
  EnableServiceFee: Joi.boolean().default(false)
});

const deliverySchema = Joi.object({
  AutoDelivery: Joi.boolean().default(false),
  EnableServiceFee: Joi.boolean().default(false)
});

const createProviderSchema = Joi.object({
  ProviderName: Joi.string().trim().max(200).required()
    .messages({
      'string.empty': 'Provider name is required',
      'string.max': 'Provider name cannot exceed 200 characters',
      'any.required': 'Provider name is required'
    }),
  ProviderStatus: Joi.string().trim().max(100).allow('', null).optional(),
  ProviderPricing: Joi.boolean().default(false),
  PreparationTime: Joi.string().trim().max(50).allow('', null).optional(),
  StoreId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/),
    Joi.allow(null)
  ).optional(),
  PickUp: Joi.array().items(pickUpSchema).default([]),
  Delivery: Joi.array().items(deliverySchema).default([]),
  Status: Joi.boolean().default(true)
});

const updateProviderSchema = Joi.object({
  ProviderName: Joi.string().trim().max(200).optional(),
  ProviderStatus: Joi.string().trim().max(100).allow('', null).optional(),
  ProviderPricing: Joi.boolean().optional(),
  PreparationTime: Joi.string().trim().max(50).allow('', null).optional(),
  StoreId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/),
    Joi.allow(null)
  ).optional(),
  PickUp: Joi.array().items(pickUpSchema).optional(),
  Delivery: Joi.array().items(deliverySchema).optional(),
  Status: Joi.boolean().optional()
});

const getProviderByIdSchema = Joi.object({
  id: Joi.string().required()
    .messages({
      'string.empty': 'Provider ID is required',
      'any.required': 'Provider ID is required'
    })
});

const getAllProvidersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  StoreId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

const getProvidersByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  StoreId: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/)
  ).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

module.exports = {
  createProviderSchema,
  updateProviderSchema,
  getProviderByIdSchema,
  getAllProvidersSchema,
  getProvidersByAuthSchema
};
