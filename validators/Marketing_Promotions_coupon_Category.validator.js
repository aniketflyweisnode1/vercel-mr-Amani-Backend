const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const createMarketingCouponCategorySchema = Joi.object({
  CategoryName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.base': 'Category name must be a string',
      'string.empty': 'Category name is required',
      'string.min': 'Category name must have at least 2 characters',
      'string.max': 'Category name cannot exceed 200 characters',
      'any.required': 'Category name is required'
    }),
  Description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateMarketingCouponCategorySchema = Joi.object({
  CategoryName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Category name must have at least 2 characters',
      'string.max': 'Category name cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getMarketingCouponCategoryByIdSchema = Joi.object({
  id: idAlternative.required().messages({
    'alternatives.match': 'Category ID must be a valid ObjectId or positive number',
    'any.required': 'Category ID is required'
  })
});

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().trim().max(200).optional().allow('').messages({
    'string.max': 'Search term cannot exceed 200 characters'
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'Status must be a boolean value'
  }),
  business_Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Business branch ID must be a number',
      'number.integer': 'Business branch ID must be an integer',
      'number.positive': 'Business branch ID must be a positive number'
    }),
  sortBy: Joi.string().valid('CategoryName', 'created_at', 'updated_at', 'Marketing_Promotions_coupon_Category_id').default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: CategoryName, created_at, updated_at, Marketing_Promotions_coupon_Category_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Sort order must be either asc or desc'
  })
};

const getAllMarketingCouponCategoriesSchema = Joi.object({
  ...paginationQuery
});

const getMarketingCouponCategoriesByAuthSchema = Joi.object({
  ...paginationQuery
});

module.exports = {
  createMarketingCouponCategorySchema,
  updateMarketingCouponCategorySchema,
  getMarketingCouponCategoryByIdSchema,
  getAllMarketingCouponCategoriesSchema,
  getMarketingCouponCategoriesByAuthSchema
};

