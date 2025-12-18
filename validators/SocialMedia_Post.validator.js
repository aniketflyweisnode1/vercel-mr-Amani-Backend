const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const postFromSchema = Joi.object({
  PersonalId: Joi.boolean().optional(),
  BusinessPage: Joi.boolean().optional()
}).optional();

const platformsSchema = Joi.object({
  showTalk: Joi.boolean().optional(),
  instagram: Joi.boolean().optional(),
  facebook: Joi.boolean().optional(),
  ourApp: Joi.boolean().optional()
}).optional();

const createSocialMediaPostSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Content: Joi.string().trim().max(2000).optional().allow(''),
  image_Video: Joi.string().trim().uri().optional().allow(''),
  PostFrom: postFromSchema,
  Platforms: platformsSchema,
  ScheduleLater: Joi.boolean().optional(),
  ScheduleDate: Joi.date()
    .optional()
    .allow(null)
    .when('ScheduleLater', {
      is: true,
      then: Joi.required().messages({
        'any.required': 'ScheduleDate is required when ScheduleLater is true'
      })
    }),
  ScheduleTime: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('', null)
    .when('ScheduleLater', {
      is: true,
      then: Joi.required().messages({
        'any.required': 'ScheduleTime is required when ScheduleLater is true'
      })
    }),
  Tag: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Music: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Caption: Joi.string().trim().max(500).optional().allow(''),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Reel_Id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
});

const updateSocialMediaPostSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Content: Joi.string().trim().max(2000).optional().allow(''),
  image_Video: Joi.string().trim().uri().optional().allow(''),
  PostFrom: postFromSchema,
  Platforms: platformsSchema,
  ScheduleLater: Joi.boolean().optional(),
  ScheduleDate: Joi.date().optional().allow(null),
  ScheduleTime: Joi.string().trim().max(20).optional().allow('', null),
  Tag: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Music: Joi.array().items(Joi.string().trim().max(100)).optional(),
  Caption: Joi.string().trim().max(500).optional().allow(''),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Reel_Id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getSocialMediaPostByIdSchema = Joi.object({
  id: idAlternative.required()
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  ScheduleLater: Joi.boolean().optional(),
  Reel_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid(
    'created_at',
    'updated_at',
    'SocialMedia_Post_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllSocialMediaPostsSchema = Joi.object({
  ...baseListQuery
});

const getSocialMediaPostsByAuthSchema = Joi.object({
  ...baseListQuery
});

const getSocialMediaPostsByBranchParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  createSocialMediaPostSchema,
  updateSocialMediaPostSchema,
  getSocialMediaPostByIdSchema,
  getAllSocialMediaPostsSchema,
  getSocialMediaPostsByAuthSchema,
  getSocialMediaPostsByBranchParamsSchema
};

