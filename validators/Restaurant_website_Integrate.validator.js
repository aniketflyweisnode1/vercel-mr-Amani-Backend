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
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_website_Integrate_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createIntegrationSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  websiteName: Joi.string().trim().min(2).max(150).required(),
  websiteUrl: Joi.string().trim().uri().max(500).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateIntegrationSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  websiteName: Joi.string().trim().min(2).max(150).optional(),
  websiteUrl: Joi.string().trim().uri().max(500).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getIntegrationByIdSchema = Joi.object({
  id: idSchema
});

const getAllIntegrationsSchema = Joi.object(paginationSchema);

const getIntegrationsByAuthSchema = Joi.object(paginationSchema);

const getIntegrationsByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  createIntegrationSchema,
  updateIntegrationSchema,
  getIntegrationByIdSchema,
  getAllIntegrationsSchema,
  getIntegrationsByAuthSchema,
  getIntegrationsByBranchParamsSchema
};


