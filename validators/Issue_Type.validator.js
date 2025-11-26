const Joi = require('joi');

const createIssueTypeSchema = Joi.object({
  Issue_type: Joi.string().trim().max(200).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateIssueTypeSchema = Joi.object({
  Issue_type: Joi.string().trim().max(200).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getIssueTypeByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllIssueTypesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Issue_Type_id', 'Issue_type').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getIssueTypesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Issue_Type_id', 'Issue_type').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createIssueTypeSchema,
  updateIssueTypeSchema,
  getIssueTypeByIdSchema,
  getAllIssueTypesSchema,
  getIssueTypesByAuthSchema
};

