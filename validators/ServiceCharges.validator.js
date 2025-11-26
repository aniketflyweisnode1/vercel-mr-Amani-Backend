const Joi = require('joi');

const createServiceChargesSchema = Joi.object({
  ServiceCharges_type_id: Joi.number().integer().positive().required(),
  Service_Restaurant_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(2).max(200).required(),
  charges: Joi.number().min(0).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateServiceChargesSchema = Joi.object({
  ServiceCharges_type_id: Joi.number().integer().positive().optional(),
  Service_Restaurant_id: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().min(2).max(200).optional(),
  charges: Joi.number().min(0).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getServiceChargesByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllServiceChargesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  ServiceCharges_type_id: Joi.number().integer().positive().optional(),
  Service_Restaurant_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'ServiceCharges_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceChargesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  ServiceCharges_type_id: Joi.number().integer().positive().optional(),
  Service_Restaurant_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'ServiceCharges_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceChargesByTypeIdParamsSchema = Joi.object({
  ServiceCharges_type_id: Joi.number().integer().positive().required()
});

const getServiceChargesByTypeIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Service_Restaurant_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'ServiceCharges_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceChargesByServiceRestaurantIdParamsSchema = Joi.object({
  Service_Restaurant_id: Joi.number().integer().positive().required()
});

const getServiceChargesByServiceRestaurantIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  ServiceCharges_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'ServiceCharges_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceChargesByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getServiceChargesByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  ServiceCharges_type_id: Joi.number().integer().positive().optional(),
  Service_Restaurant_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'ServiceCharges_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createServiceChargesSchema,
  updateServiceChargesSchema,
  getServiceChargesByIdSchema,
  getAllServiceChargesSchema,
  getServiceChargesByAuthSchema,
  getServiceChargesByTypeIdParamsSchema,
  getServiceChargesByTypeIdQuerySchema,
  getServiceChargesByServiceRestaurantIdParamsSchema,
  getServiceChargesByServiceRestaurantIdQuerySchema,
  getServiceChargesByBusinessBranchIdParamsSchema,
  getServiceChargesByBusinessBranchIdQuerySchema
};

