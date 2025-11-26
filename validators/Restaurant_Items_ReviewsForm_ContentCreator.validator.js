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
  Country: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'ReviewsForm_ContentCreator_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createContentCreatorSchema = Joi.object({
  Name: Joi.string().trim().min(2).max(150).required(),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Email: Joi.string().trim().email().optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateContentCreatorSchema = Joi.object({
  Name: Joi.string().trim().min(2).max(150).optional(),
  Country: Joi.string().trim().max(100).optional().allow(''),
  Phone: Joi.string().trim().max(20).optional().allow(''),
  Email: Joi.string().trim().email().optional().allow(''),
  Budget: Joi.number().min(0).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getContentCreatorByIdSchema = Joi.object({
  id: idSchema
});

const getAllContentCreatorsSchema = Joi.object(paginationSchema);

const getContentCreatorsByAuthSchema = Joi.object(paginationSchema);

module.exports = {
  createContentCreatorSchema,
  updateContentCreatorSchema,
  getContentCreatorByIdSchema,
  getAllContentCreatorsSchema,
  getContentCreatorsByAuthSchema
};


