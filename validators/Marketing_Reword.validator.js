const Joi = require('joi');

const createMarketingRewordSchema = Joi.object({
  Brnach_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Branch ID must be a number',
    'number.integer': 'Branch ID must be an integer',
    'number.positive': 'Branch ID must be a positive number',
    'any.required': 'Branch ID is required'
  }),
  loyalityRewords: Joi.boolean().optional().default(false),
  singular: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Singular cannot exceed 200 characters'
  }),
  plural: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Plural cannot exceed 200 characters'
  }),
  pointsRedemption: Joi.number().integer().min(0).optional().default(0).messages({
    'number.base': 'Points redemption must be a number',
    'number.integer': 'Points redemption must be an integer',
    'number.min': 'Points redemption cannot be negative'
  }),
  RedemptionValue: Joi.number().min(0).optional().default(0).messages({
    'number.base': 'Redemption value must be a number',
    'number.min': 'Redemption value cannot be negative'
  }),
  Status: Joi.boolean().optional().default(true)
});

const updateMarketingRewordSchema = Joi.object({
  Brnach_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Branch ID must be a number',
    'number.integer': 'Branch ID must be an integer',
    'number.positive': 'Branch ID must be a positive number'
  }),
  loyalityRewords: Joi.boolean().optional(),
  singular: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Singular cannot exceed 200 characters'
  }),
  plural: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Plural cannot exceed 200 characters'
  }),
  pointsRedemption: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Points redemption must be a number',
    'number.integer': 'Points redemption must be an integer',
    'number.min': 'Points redemption cannot be negative'
  }),
  RedemptionValue: Joi.number().min(0).optional().messages({
    'number.base': 'Redemption value must be a number',
    'number.min': 'Redemption value cannot be negative'
  }),
  Status: Joi.boolean().optional()
}).min(1);

const getMarketingRewordByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllMarketingRewordsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Brnach_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Marketing_Reword_id', 'singular', 'plural', 'pointsRedemption', 'RedemptionValue').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getMarketingRewordsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Marketing_Reword_id', 'singular', 'plural', 'pointsRedemption', 'RedemptionValue').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createMarketingRewordSchema,
  updateMarketingRewordSchema,
  getMarketingRewordByIdSchema,
  getAllMarketingRewordsSchema,
  getMarketingRewordsByAuthSchema
};
