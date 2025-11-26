const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const keywordSchema = Joi.array()
  .items(Joi.string().trim().max(200))
  .optional();

const createSEOManagementSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  website: Joi.string().trim().uri().required().messages({
    'string.base': 'Website must be a string',
    'string.uri': 'Website must be a valid URL',
    'any.required': 'Website is required'
  }),
  KeyWord: keywordSchema,
  TargetPositons: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
});

const updateSEOManagementSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  website: Joi.string().trim().uri().optional(),
  KeyWord: keywordSchema,
  TargetPositons: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getSEOManagementByIdSchema = Joi.object({
  id: idAlternative.required()
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'SEO_Management_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllSEOManagementSchema = Joi.object({
  ...baseListQuery
});

const getSEOManagementByAuthSchema = Joi.object({
  ...baseListQuery
});

const getSEOManagementByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  createSEOManagementSchema,
  updateSEOManagementSchema,
  getSEOManagementByIdSchema,
  getAllSEOManagementSchema,
  getSEOManagementByAuthSchema,
  getSEOManagementByBranchParamsSchema
};

