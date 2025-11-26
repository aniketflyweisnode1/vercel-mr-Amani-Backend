const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const platformsSchema = Joi.object({
  showTalk: Joi.boolean().optional(),
  instagram: Joi.boolean().optional(),
  facebook: Joi.boolean().optional(),
  ourApp: Joi.boolean().optional()
}).optional();

const createSocialMediaLiveSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  liveSubject: Joi.string().trim().min(2).max(500).required(),
  liveDescription: Joi.string().trim().max(2000).optional().allow(''),
  PlatForms: platformsSchema,
  Reel_Id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
});

const updateSocialMediaLiveSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  liveSubject: Joi.string().trim().min(2).max(500).optional(),
  liveDescription: Joi.string().trim().max(2000).optional().allow(''),
  PlatForms: platformsSchema,
  Reel_Id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getSocialMediaLiveByIdSchema = Joi.object({
  id: idAlternative.required()
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  Reel_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid(
    'created_at',
    'updated_at',
    'SocialMedia_Live_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllSocialMediaLivesSchema = Joi.object({
  ...baseListQuery
});

const getSocialMediaLivesByAuthSchema = Joi.object({
  ...baseListQuery
});

const getSocialMediaLivesByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  createSocialMediaLiveSchema,
  updateSocialMediaLiveSchema,
  getSocialMediaLiveByIdSchema,
  getAllSocialMediaLivesSchema,
  getSocialMediaLivesByAuthSchema,
  getSocialMediaLivesByBranchParamsSchema
};

