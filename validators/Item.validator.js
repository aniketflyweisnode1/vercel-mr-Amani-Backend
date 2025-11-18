const Joi = require('joi');

const createItemSchema = Joi.object({
  service_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.empty': 'Service ID is required',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 150 characters'
    }),
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
  item_price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Item price must be a number',
      'number.min': 'Item price cannot be negative',
      'any.required': 'Item price is required'
    }),
  item_image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Item image URL cannot exceed 500 characters'
    }),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateItemSchema = Joi.object({
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 150 characters'
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
  item_price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Item price must be a number',
      'number.min': 'Item price cannot be negative'
    }),
  item_image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Item image URL cannot exceed 500 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getItemByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty': 'Item ID is required',
      'string.pattern.base': 'Please provide a valid item ID'
    })
});

const getAllItemsSchema = Joi.object({
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
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
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
    .valid('name', 'created_at', 'updated_at', 'Item_id', 'item_price')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at, Item_id, item_price'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getItemsByAuthSchema = Joi.object({
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
  service_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Service ID must be a number',
      'number.integer': 'Service ID must be an integer',
      'number.positive': 'Service ID must be a positive number'
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
    .valid('name', 'created_at', 'updated_at', 'Item_id', 'item_price')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at, Item_id, item_price'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createItemSchema,
  updateItemSchema,
  getItemByIdSchema,
  getAllItemsSchema,
  getItemsByAuthSchema
};

