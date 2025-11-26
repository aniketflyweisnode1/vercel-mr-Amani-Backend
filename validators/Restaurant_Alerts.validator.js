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
  Restaurant_Alerts_type_id: Joi.number().integer().positive().optional(),
  model: Joi.string().trim().max(150).optional(),
  referenceId: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_Alerts_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createRestaurantAlertSchema = Joi.object({
  Restaurant_Alerts_type_id: Joi.number().integer().positive().required(),
  Alerts: Joi.string().trim().min(2).max(200).required(),
  model: Joi.string().trim().max(150).optional(),
  id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateRestaurantAlertSchema = Joi.object({
  Restaurant_Alerts_type_id: Joi.number().integer().positive().optional(),
  Alerts: Joi.string().trim().min(2).max(200).optional(),
  model: Joi.string().trim().max(150).optional(),
  id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getRestaurantAlertByIdSchema = Joi.object({
  id: idSchema
});

const getAllRestaurantAlertsSchema = Joi.object(paginationBase);

const getRestaurantAlertsByAuthSchema = Joi.object(paginationBase);

const getRestaurantAlertsByTypeIdParamsSchema = Joi.object({
  Restaurant_Alerts_type_id: Joi.number().integer().positive().required()
});

const getRestaurantAlertsByModelQuerySchema = Joi.object({
  model: Joi.string().trim().max(150).required(),
  referenceId: Joi.number().integer().positive().optional()
});

module.exports = {
  createRestaurantAlertSchema,
  updateRestaurantAlertSchema,
  getRestaurantAlertByIdSchema,
  getAllRestaurantAlertsSchema,
  getRestaurantAlertsByAuthSchema,
  getRestaurantAlertsByTypeIdParamsSchema,
  getRestaurantAlertsByModelQuerySchema
};


