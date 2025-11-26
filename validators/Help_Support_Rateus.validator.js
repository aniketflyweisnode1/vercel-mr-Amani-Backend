const Joi = require('joi');

const yourFeelSchema = Joi.object({
  status: Joi.string().trim().max(100).optional().allow(''),
  Emozi: Joi.string().trim().max(50).optional().allow('')
});

const createHelpSupportRateusSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required(),
  YourFeel: yourFeelSchema.optional(),
  Feedback: Joi.string().trim().max(2000).optional().allow(''),
  Ratings: Joi.number().min(0).max(5).optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateHelpSupportRateusSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().optional(),
  YourFeel: yourFeelSchema.optional(),
  Feedback: Joi.string().trim().max(2000).optional().allow(''),
  Ratings: Joi.number().min(0).max(5).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getHelpSupportRateusByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllHelpSupportRateusesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportRateusesByFeelParamsSchema = Joi.object({
  feel: Joi.string().trim().max(100).required()
});

const getHelpSupportRateusesByFeelQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportRateusesByBranchIdParamsSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required()
});

const getHelpSupportRateusesByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportRateusesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHelpSupportRateusSchema,
  updateHelpSupportRateusSchema,
  getHelpSupportRateusByIdSchema,
  getAllHelpSupportRateusesSchema,
  getHelpSupportRateusesByFeelParamsSchema,
  getHelpSupportRateusesByFeelQuerySchema,
  getHelpSupportRateusesByBranchIdParamsSchema,
  getHelpSupportRateusesByBranchIdQuerySchema,
  getHelpSupportRateusesByAuthSchema
};

