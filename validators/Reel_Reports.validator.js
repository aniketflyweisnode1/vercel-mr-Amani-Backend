const Joi = require('joi');

const createReelReportsSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().required(),
  ReportBy: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateReelReportsSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().optional(),
  ReportBy: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getReelReportsByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllReelReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Real_Post_id: Joi.number().integer().positive().optional(),
  ReportBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Reports_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReelReportsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Real_Post_id: Joi.number().integer().positive().optional(),
  ReportBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Reports_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getReelReportsByReelIdParamsSchema = Joi.object({
  reelId: Joi.number().integer().positive().required()
});

const getReelReportsByReelIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  ReportBy: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Reel_Reports_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createReelReportsSchema,
  updateReelReportsSchema,
  getReelReportsByIdSchema,
  getAllReelReportsSchema,
  getReelReportsByAuthSchema,
  getReelReportsByReelIdParamsSchema,
  getReelReportsByReelIdQuerySchema
};

