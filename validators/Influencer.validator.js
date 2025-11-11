const Joi = require('joi');

const businessDocumentSchema = Joi.object({
  name: Joi.string().trim().max(200).optional().allow(''),
  image: Joi.string().trim().optional().allow('')
});

const createInfluencerSchema = Joi.object({
  User_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be a positive number',
    'any.required': 'User ID is required'
  }),
  IdVerfication_type: Joi.string().trim().max(100).optional().allow('', null),
  VerificationId_Image: Joi.string().trim().optional().allow('', null),
  TaxInformationType: Joi.string().trim().max(100).optional().allow('', null),
  Tax_Image: Joi.string().trim().optional().allow('', null),
  Bank_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Bank ID must be a number',
    'number.integer': 'Bank ID must be an integer',
    'number.positive': 'Bank ID must be a positive number',
    'any.required': 'Bank ID is required'
  }),
  BusinessDcouments: Joi.array().items(businessDocumentSchema).optional().default([]),
  emozi: Joi.string().trim().optional().allow('', null),
  Status: Joi.boolean().optional().default(true)
});

const updateInfluencerSchema = Joi.object({
  User_id: Joi.number().integer().positive().optional(),
  IdVerfication_type: Joi.string().trim().max(100).optional().allow('', null),
  VerificationId_Image: Joi.string().trim().optional().allow('', null),
  TaxInformationType: Joi.string().trim().max(100).optional().allow('', null),
  Tax_Image: Joi.string().trim().optional().allow('', null),
  Bank_id: Joi.number().integer().positive().optional(),
  BusinessDcouments: Joi.array().items(businessDocumentSchema).optional(),
  emozi: Joi.string().trim().optional().allow('', null),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getInfluencerByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Influencer ID must be a valid ObjectId or positive number',
      'string.empty': 'Influencer ID is required'
    })
});

const getAllInfluencersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  user_id: Joi.number().integer().positive().optional(),
  bank_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Influencer_id', 'User_id').optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getInfluencersByAuthSchema = Joi.object({
  // Currently no query params; schema included for consistency
});

module.exports = {
  createInfluencerSchema,
  updateInfluencerSchema,
  getInfluencerByIdSchema,
  getAllInfluencersSchema,
  getInfluencersByAuthSchema
};
