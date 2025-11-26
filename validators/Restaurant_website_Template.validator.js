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
  sortBy: Joi.string().valid('TempleteName', 'created_at', 'updated_at', 'Restaurant_website_Template_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createTemplateSchema = Joi.object({
  TempleteName: Joi.string().trim().min(2).max(150).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateTemplateSchema = Joi.object({
  TempleteName: Joi.string().trim().min(2).max(150).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getTemplateByIdSchema = Joi.object({
  id: idSchema
});

const getAllTemplatesSchema = Joi.object(paginationSchema);

const getTemplatesByAuthSchema = Joi.object(paginationSchema);

module.exports = {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateByIdSchema,
  getAllTemplatesSchema,
  getTemplatesByAuthSchema
};


