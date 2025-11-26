const Joi = require('joi');

const createDiscountsMapUserSchema = Joi.object({
  User_id: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateDiscountsMapUserSchema = Joi.object({
  User_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getDiscountsMapUserByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllDiscountsMapUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_User_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapUsersByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  User_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_User_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapUsersByUserIdParamsSchema = Joi.object({
  User_id: Joi.number().integer().positive().required()
});

const getDiscountsMapUsersByUserIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_User_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapUsersByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getDiscountsMapUsersByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  User_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_User_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDiscountsMapUserSchema,
  updateDiscountsMapUserSchema,
  getDiscountsMapUserByIdSchema,
  getAllDiscountsMapUsersSchema,
  getDiscountsMapUsersByAuthSchema,
  getDiscountsMapUsersByUserIdParamsSchema,
  getDiscountsMapUsersByUserIdQuerySchema,
  getDiscountsMapUsersByBusinessBranchIdParamsSchema,
  getDiscountsMapUsersByBusinessBranchIdQuerySchema
};

