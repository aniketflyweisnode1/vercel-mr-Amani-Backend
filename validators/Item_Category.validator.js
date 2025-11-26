const Joi = require('joi');

const createItemCategorySchema = Joi.object({
  item_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Item type ID must be a number',
      'number.empty': 'Item type ID is required',
      'number.integer': 'Item type ID must be an integer',
      'number.positive': 'Item type ID must be a positive number'
    }),
  CategoryName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 150 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateItemCategorySchema = Joi.object({
  item_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item type ID must be a number',
      'number.integer': 'Item type ID must be an integer',
      'number.positive': 'Item type ID must be a positive number'
    }),
  CategoryName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .optional()
    .messages({
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 150 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getItemCategoryByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Item category ID must be a valid ObjectId or positive number',
      'string.empty': 'Item category ID is required'
    })
});

const paginatedQuerySchema = {
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .max(150)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 150 characters'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    }),
  item_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Item type ID must be a number',
      'number.integer': 'Item type ID must be an integer',
      'number.positive': 'Item type ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('CategoryName', 'created_at', 'updated_at', 'item_Category_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: CategoryName, created_at, updated_at, item_Category_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
};

const getAllItemCategoriesSchema = Joi.object(paginatedQuerySchema);

const getItemCategoriesByAuthSchema = Joi.object(paginatedQuerySchema);

const getItemCategoriesByTypeIdParamsSchema = Joi.object({
  item_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Item type ID must be a number',
      'number.empty': 'Item type ID is required',
      'number.integer': 'Item type ID must be an integer',
      'number.positive': 'Item type ID must be a positive number'
    })
});

const getItemCategoriesByTypeIdQuerySchema = Joi.object({
  ...paginatedQuerySchema,
  item_type_id: Joi.forbidden()
});

module.exports = {
  createItemCategorySchema,
  updateItemCategorySchema,
  getItemCategoryByIdSchema,
  getAllItemCategoriesSchema,
  getItemCategoriesByAuthSchema,
  getItemCategoriesByTypeIdParamsSchema,
  getItemCategoriesByTypeIdQuerySchema
};
