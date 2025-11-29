const Joi = require('joi');

const createReferralSchema = Joi.object({
  Referral_To: Joi.number().integer().positive().required(),
  Referral_from: Joi.number().integer().positive().required(),
  Earning: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional().default(true)
});

const updateReferralSchema = Joi.object({
  Referral_To: Joi.number().integer().positive().optional(),
  Referral_from: Joi.number().integer().positive().optional(),
  Earning: Joi.number().integer().positive().optional().allow(null),
  Status: Joi.boolean().optional()
}).min(1);

const getReferralByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllReferralsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  Referral_To: Joi.number().integer().positive().optional(),
  Referral_from: Joi.number().integer().positive().optional(),
  Earning: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Referral_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReferralsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  Referral_To: Joi.number().integer().positive().optional(),
  Referral_from: Joi.number().integer().positive().optional(),
  Earning: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Referral_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createReferralSchema,
  updateReferralSchema,
  getReferralByIdSchema,
  getAllReferralsSchema,
  getReferralsByAuthSchema
};

