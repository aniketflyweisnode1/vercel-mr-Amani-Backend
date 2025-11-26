const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const createCampaignTypeSchema = Joi.object({
  CampaignTypeName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'Campaign type name must be a string',
      'string.empty': 'Campaign type name is required',
      'string.min': 'Campaign type name must have at least 2 characters',
      'string.max': 'Campaign type name cannot exceed 200 characters',
      'any.required': 'Campaign type name is required'
    }),
  Description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateCampaignTypeSchema = Joi.object({
  CampaignTypeName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional(),
  Description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow(''),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getCampaignTypeByIdSchema = Joi.object({
  id: idAlternative.required().messages({
    'alternatives.match': 'Campaign type ID must be a valid ObjectId or positive number',
    'any.required': 'Campaign type ID is required'
  })
});

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('CampaignTypeName', 'created_at', 'updated_at', 'CampaignType_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllCampaignTypesSchema = Joi.object({
  ...paginationQuery
});

const getCampaignTypesByAuthSchema = Joi.object({
  ...paginationQuery
});

const getCampaignTypeByTypeIdParamsSchema = Joi.object({
  CampaignType_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Campaign type ID must be a number',
      'number.integer': 'Campaign type ID must be an integer',
      'number.positive': 'Campaign type ID must be a positive number',
      'any.required': 'Campaign type ID is required'
    })
});

module.exports = {
  createCampaignTypeSchema,
  updateCampaignTypeSchema,
  getCampaignTypeByIdSchema,
  getAllCampaignTypesSchema,
  getCampaignTypesByAuthSchema,
  getCampaignTypeByTypeIdParamsSchema
};

