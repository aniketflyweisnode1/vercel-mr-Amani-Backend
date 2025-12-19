const Joi = require('joi');

const TARGET_SEGMENTS = ['All customers', 'VIP', 'RequentCustomers'];

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const createSmsCampaignSchema = Joi.object({
  Campaignname: Joi.string().trim().min(2).max(200).required(),
  CampaignType_id: Joi.number().integer().positive().required(),
  TargetCustomerSegment: Joi.string().valid(...TARGET_SEGMENTS).required(),
  City_id: Joi.number().integer().positive().required(),
  ScheduleSend: Joi.boolean().optional(),
  PromoCode: Joi.string().trim().max(100).optional().allow(''),
  CallToActionLink: Joi.string().trim().uri().optional().allow(''),
  Notes: Joi.string().trim().max(2000).optional().allow(''),
  Branch_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  store_id: Joi.number().integer().positive().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
});

const updateSmsCampaignSchema = Joi.object({
  Campaignname: Joi.string().trim().min(2).max(200).optional(),
  CampaignType_id: Joi.number().integer().positive().optional(),
  TargetCustomerSegment: Joi.string().valid(...TARGET_SEGMENTS).optional(),
  City_id: Joi.number().integer().positive().optional(),
  ScheduleSend: Joi.boolean().optional(),
  PromoCode: Joi.string().trim().max(100).optional().allow(''),
  CallToActionLink: Joi.string().trim().uri().optional().allow(''),
  Notes: Joi.string().trim().max(2000).optional().allow(''),
  Branch_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  store_id: Joi.number().integer().positive().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getSmsCampaignByIdSchema = Joi.object({
  id: idAlternative.required()
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  CampaignType_id: Joi.number().integer().positive().optional(),
  City_id: Joi.number().integer().positive().optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  TargetCustomerSegment: Joi.string().valid(...TARGET_SEGMENTS).optional(),
  ScheduleSend: Joi.boolean().optional(),
  sortBy: Joi.string().valid(
    'Campaignname',
    'created_at',
    'updated_at',
    'Marketing_Promotions_SMSCampaign_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllSmsCampaignsSchema = Joi.object({
  ...baseListQuery
});

const getSmsCampaignsByAuthSchema = Joi.object({
  ...baseListQuery
});

module.exports = {
  createSmsCampaignSchema,
  updateSmsCampaignSchema,
  getSmsCampaignByIdSchema,
  getAllSmsCampaignsSchema,
  getSmsCampaignsByAuthSchema,
  TARGET_SEGMENTS
};

