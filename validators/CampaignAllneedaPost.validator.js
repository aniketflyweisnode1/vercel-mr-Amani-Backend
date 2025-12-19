const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const postEntrySchema = Joi.object({
  Picture: Joi.string().trim().uri().optional().allow(''),
  Video: Joi.string().trim().uri().optional().allow(''),
  Live: Joi.string().trim().uri().optional().allow('')
});

const createCampaignAllneedaPostSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Post: Joi.array().items(postEntrySchema).optional(),
  Caption: Joi.string().trim().max(500).optional().allow(''),
  Tag: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Music: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  CompaingName: Joi.string().trim().max(200).optional().allow(''),
  CompaingnType: Joi.string().trim().max(100).optional().allow(''),
  TargetCustomer: Joi.string().trim().max(500).optional().allow(''),
  Region_city: Joi.string().trim().max(200).optional().allow(''),
  PromoCode: Joi.string().trim().max(50).optional().allow(''),
  CallToActivelink: Joi.string().trim().uri().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
});

const updateCampaignAllneedaPostSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Post: Joi.array().items(postEntrySchema).optional(),
  Caption: Joi.string().trim().max(500).optional().allow(''),
  Tag: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Music: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  CompaingName: Joi.string().trim().max(200).optional().allow(''),
  CompaingnType: Joi.string().trim().max(100).optional().allow(''),
  TargetCustomer: Joi.string().trim().max(500).optional().allow(''),
  Region_city: Joi.string().trim().max(200).optional().allow(''),
  PromoCode: Joi.string().trim().max(50).optional().allow(''),
  CallToActivelink: Joi.string().trim().uri().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getCampaignAllneedaPostByIdSchema = Joi.object({
  id: idAlternative.required().messages({
    'alternatives.match': 'ID must be a valid ObjectId or positive number',
    'any.required': 'ID is required'
  })
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid(
    'created_at',
    'updated_at',
    'CampaignAllneedaPost_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllCampaignAllneedaPostsSchema = Joi.object({
  ...baseListQuery
});

const getCampaignAllneedaPostsByAuthSchema = Joi.object({
  ...baseListQuery
});

module.exports = {
  createCampaignAllneedaPostSchema,
  updateCampaignAllneedaPostSchema,
  getCampaignAllneedaPostByIdSchema,
  getAllCampaignAllneedaPostsSchema,
  getCampaignAllneedaPostsByAuthSchema
};

