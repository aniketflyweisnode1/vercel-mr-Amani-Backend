const Joi = require('joi');

const productArraySchema = Joi.array()
  .items(
    Joi.number()
      .integer()
      .positive()
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be a positive number'
      })
  )
  .unique()
  .messages({
    'array.base': 'Product array must be an array',
    'array.unique': 'Product array contains duplicate entries'
  });

const createDasboardListSchema = Joi.object({
  FoodYouMaylike: productArraySchema.optional().default([]),
  GrabYourDeal: productArraySchema.optional().default([]),
  FeaturedProductForYou: productArraySchema.optional().default([]),
  Status: Joi.boolean().optional().default(true)
});

const updateDasboardListSchema = Joi.object({
  FoodYouMaylike: productArraySchema.optional(),
  GrabYourDeal: productArraySchema.optional(),
  FeaturedProductForYou: productArraySchema.optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getDasboardListByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllDasboardListsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'DasboardList_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDasboardListsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'DasboardList_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDasboardListSchema,
  updateDasboardListSchema,
  getDasboardListByIdSchema,
  getAllDasboardListsSchema,
  getDasboardListsByAuthSchema
};

