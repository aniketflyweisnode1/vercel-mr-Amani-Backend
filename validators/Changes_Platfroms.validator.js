const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const platformSchema = Joi.object({
  Name: Joi.string().trim().max(200).optional().allow('', null),
  Status: Joi.boolean().optional().default(false)
});

const createChangesPlatfromsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().required(),
  Platform: Joi.array().items(platformSchema).optional().default([]),
  Status: Joi.boolean().optional().default(true)
});

const updateChangesPlatfromsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().optional(),
  Platform: Joi.array().items(platformSchema).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getChangesPlatfromsByIdSchema = Joi.object({
  id: idSchema
});

const getAllChangesPlatfromsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Changes_Platfroms_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getChangesPlatfromsByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.number().integer().positive().required()
});

const getChangesPlatfromsByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Changes_Platfroms_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getChangesPlatfromsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().trim().optional().allow('', null),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Changes_Platfroms_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createChangesPlatfromsSchema,
  updateChangesPlatfromsSchema,
  getChangesPlatfromsByIdSchema,
  getAllChangesPlatfromsSchema,
  getChangesPlatfromsByBranchIdParamsSchema,
  getChangesPlatfromsByBranchIdQuerySchema,
  getChangesPlatfromsByAuthSchema
};
