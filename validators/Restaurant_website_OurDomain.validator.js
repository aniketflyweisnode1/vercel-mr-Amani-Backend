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
  Restaurant_website_Template_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_website_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createOurDomainSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  websiteName: Joi.string().trim().min(2).max(150).required(),
  subdomain: Joi.string().trim().min(2).max(150).required(),
  Restaurant_website_Template_id: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateOurDomainSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  websiteName: Joi.string().trim().min(2).max(150).optional(),
  subdomain: Joi.string().trim().min(2).max(150).optional(),
  Restaurant_website_Template_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getOurDomainByIdSchema = Joi.object({
  id: idSchema
});

const getAllOurDomainsSchema = Joi.object(paginationSchema);

const getOurDomainsByAuthSchema = Joi.object(paginationSchema);

const getOurDomainsByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getOurDomainsByBranchQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Restaurant_website_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getOurDomainsByReviewsStatusParamsSchema = Joi.object({
  ReviewsStatus: Joi.string().valid('true', 'false', 'active', 'inactive', '1', '0').required()
});

module.exports = {
  createOurDomainSchema,
  updateOurDomainSchema,
  getOurDomainByIdSchema,
  getAllOurDomainsSchema,
  getOurDomainsByAuthSchema,
  getOurDomainsByBranchParamsSchema,
  getOurDomainsByBranchQuerySchema,
  getOurDomainsByReviewsStatusParamsSchema
};


