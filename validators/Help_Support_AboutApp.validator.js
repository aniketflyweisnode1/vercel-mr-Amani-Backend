const Joi = require('joi');

const createHelpSupportAboutAppSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required(),
  logo: Joi.string().trim().max(500).optional().allow(''),
  aboutus: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateHelpSupportAboutAppSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().optional(),
  logo: Joi.string().trim().max(500).optional().allow(''),
  aboutus: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getHelpSupportAboutAppByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllHelpSupportAboutAppsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_AboutApp_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportAboutAppsByBranchIdParamsSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required()
});

const getHelpSupportAboutAppsByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_AboutApp_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportAboutAppsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_AboutApp_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHelpSupportAboutAppSchema,
  updateHelpSupportAboutAppSchema,
  getHelpSupportAboutAppByIdSchema,
  getAllHelpSupportAboutAppsSchema,
  getHelpSupportAboutAppsByBranchIdParamsSchema,
  getHelpSupportAboutAppsByBranchIdQuerySchema,
  getHelpSupportAboutAppsByAuthSchema
};

