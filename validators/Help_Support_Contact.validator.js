const Joi = require('joi');

const createHelpSupportContactSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required(),
  MobileNo: Joi.string().trim().max(20).optional().allow(''),
  Callus: Joi.string().trim().max(20).optional().allow(''),
  Emailaddress: Joi.string().trim().email().max(200).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateHelpSupportContactSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().optional(),
  MobileNo: Joi.string().trim().max(20).optional().allow(''),
  Callus: Joi.string().trim().max(20).optional().allow(''),
  Emailaddress: Joi.string().trim().email().max(200).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getHelpSupportContactByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllHelpSupportContactsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Contact_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportContactsByBranchIdParamsSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required()
});

const getHelpSupportContactsByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Contact_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportContactsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Contact_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHelpSupportContactSchema,
  updateHelpSupportContactSchema,
  getHelpSupportContactByIdSchema,
  getAllHelpSupportContactsSchema,
  getHelpSupportContactsByBranchIdParamsSchema,
  getHelpSupportContactsByBranchIdQuerySchema,
  getHelpSupportContactsByAuthSchema
};

