const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('TypeName', 'created_at', 'updated_at', 'Restaurant_Alerts_type_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createRestaurantAlertTypeSchema = Joi.object({
  TypeName: Joi.string().trim().min(2).max(150).required(),
  Status: Joi.boolean().optional().default(true)
});

const updateRestaurantAlertTypeSchema = Joi.object({
  TypeName: Joi.string().trim().min(2).max(150).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getRestaurantAlertTypeByIdSchema = Joi.object({
  id: idSchema
});

const getAllRestaurantAlertTypesSchema = Joi.object(paginationSchema);

module.exports = {
  createRestaurantAlertTypeSchema,
  updateRestaurantAlertTypeSchema,
  getRestaurantAlertTypeByIdSchema,
  getAllRestaurantAlertTypesSchema
};


