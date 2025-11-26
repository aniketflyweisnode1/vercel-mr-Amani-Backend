const Joi = require('joi');

const createServiceRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateServiceRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getServiceRestaurantByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllServiceRestaurantsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Service_Restaurant_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceRestaurantsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Service_Restaurant_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getServiceRestaurantsByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getServiceRestaurantsByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Service_Restaurant_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createServiceRestaurantSchema,
  updateServiceRestaurantSchema,
  getServiceRestaurantByIdSchema,
  getAllServiceRestaurantsSchema,
  getServiceRestaurantsByAuthSchema,
  getServiceRestaurantsByBusinessBranchIdParamsSchema,
  getServiceRestaurantsByBusinessBranchIdQuerySchema
};

