const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const createRewardSchema = Joi.object({
  loyaltyRewords: Joi.boolean().optional(),
  singular: Joi.string().trim().min(1).max(200).required(),
  plural: Joi.string().trim().min(1).max(200).required(),
  PointsRedemption: Joi.number().min(0).required(),
  RedempitonValue: Joi.number().min(0).required(),
  Status: Joi.boolean().optional()
});

const updateRewardSchema = Joi.object({
  loyaltyRewords: Joi.boolean().optional(),
  singular: Joi.string().trim().min(1).max(200).optional(),
  plural: Joi.string().trim().min(1).max(200).optional(),
  PointsRedemption: Joi.number().min(0).optional(),
  RedempitonValue: Joi.number().min(0).optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRewardByIdSchema = Joi.object({
  id: idAlternative.required()
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  loyaltyRewords: Joi.boolean().optional(),
  sortBy: Joi.string().valid(
    'singular',
    'plural',
    'created_at',
    'Marketing_Promotions_Reward_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllRewardsSchema = Joi.object({
  ...baseListQuery
});

const getRewardsByAuthSchema = Joi.object({
  ...baseListQuery
});

module.exports = {
  createRewardSchema,
  updateRewardSchema,
  getRewardByIdSchema,
  getAllRewardsSchema,
  getRewardsByAuthSchema
};

