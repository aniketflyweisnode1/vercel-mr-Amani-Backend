const Joi = require('joi');

const createHelpSupportReportAnIssueSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required(),
  Issue_type_id: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  attachfile: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateHelpSupportReportAnIssueSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().optional(),
  Issue_type_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  attachfile: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getHelpSupportReportAnIssueByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllHelpSupportReportAnIssuesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  Issue_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_ReportAnIssue_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportReportAnIssuesByIssueTypeIdParamsSchema = Joi.object({
  Issue_type_id: Joi.number().integer().positive().required()
});

const getHelpSupportReportAnIssuesByIssueTypeIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_ReportAnIssue_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportReportAnIssuesByBranchIdParamsSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required()
});

const getHelpSupportReportAnIssuesByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Issue_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_ReportAnIssue_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportReportAnIssuesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  Issue_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_ReportAnIssue_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHelpSupportReportAnIssueSchema,
  updateHelpSupportReportAnIssueSchema,
  getHelpSupportReportAnIssueByIdSchema,
  getAllHelpSupportReportAnIssuesSchema,
  getHelpSupportReportAnIssuesByIssueTypeIdParamsSchema,
  getHelpSupportReportAnIssuesByIssueTypeIdQuerySchema,
  getHelpSupportReportAnIssuesByBranchIdParamsSchema,
  getHelpSupportReportAnIssuesByBranchIdQuerySchema,
  getHelpSupportReportAnIssuesByAuthSchema
};

