const Joi = require('joi');

const createDiscountsTypeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateDiscountsTypeSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getDiscountsTypeByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Discounts type ID must be a valid ObjectId or positive number',
      'string.empty': 'Discounts type ID is required'
    })
});

const getAllDiscountsTypesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_type_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsTypesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_type_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsTypesByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getDiscountsTypesByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Discounts_type_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDiscountsTypeSchema,
  updateDiscountsTypeSchema,
  getDiscountsTypeByIdSchema,
  getAllDiscountsTypesSchema,
  getDiscountsTypesByAuthSchema,
  getDiscountsTypesByBusinessBranchIdParamsSchema,
  getDiscountsTypesByBusinessBranchIdQuerySchema
};

