const Joi = require('joi');

const createDiscountsSchema = Joi.object({
  Discounts_type_id: Joi.number().integer().positive().required(),
  name: Joi.string().trim().min(2).max(200).required(),
  pricefix: Joi.number().min(0).required(),
  pricePresentes: Joi.number().min(0).max(100).required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateDiscountsSchema = Joi.object({
  Discounts_type_id: Joi.number().integer().positive().optional(),
  name: Joi.string().trim().min(2).max(200).optional(),
  pricefix: Joi.number().min(0).optional(),
  pricePresentes: Joi.number().min(0).max(100).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getDiscountsByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllDiscountsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Discounts_type_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  Discounts_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsByTypeIdParamsSchema = Joi.object({
  Discounts_type_id: Joi.number().integer().positive().required()
});

const getDiscountsByTypeIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getDiscountsByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Discounts_type_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDiscountsSchema,
  updateDiscountsSchema,
  getDiscountsByIdSchema,
  getAllDiscountsSchema,
  getDiscountsByAuthSchema,
  getDiscountsByTypeIdParamsSchema,
  getDiscountsByTypeIdQuerySchema,
  getDiscountsByBusinessBranchIdParamsSchema,
  getDiscountsByBusinessBranchIdQuerySchema
};

