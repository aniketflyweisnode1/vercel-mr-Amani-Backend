const Joi = require('joi');

const createCateringSchema = Joi.object({
  Catering_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Type ID must be a number',
      'number.integer': 'Catering Type ID must be an integer',
      'number.positive': 'Catering Type ID must be a positive number',
      'any.required': 'Catering Type ID is required'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number',
      'any.required': 'Branch ID is required'
    }),
  Name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),
  Reating: Joi.number()
    .min(0)
    .max(5)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating cannot be negative',
      'number.max': 'Rating cannot exceed 5'
    }),
  Review: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Review must be a string',
      'string.max': 'Review cannot exceed 1000 characters'
    }),
  MinPriceOrder: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Minimum price order must be a number',
      'number.min': 'Minimum price order cannot be negative'
    }),
  Tags: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({
      'array.base': 'Tags must be an array',
      'array.includes': 'Each tag must be a string'
    }),
  CateringImage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Catering image must be a string',
      'string.max': 'Catering image path cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateCateringSchema = Joi.object({
  Catering_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Type ID must be a number',
      'number.integer': 'Catering Type ID must be an integer',
      'number.positive': 'Catering Type ID must be a positive number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  Name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 1 character long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  Reating: Joi.number()
    .min(0)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating cannot be negative',
      'number.max': 'Rating cannot exceed 5'
    }),
  Review: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Review must be a string',
      'string.max': 'Review cannot exceed 1000 characters'
    }),
  MinPriceOrder: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum price order must be a number',
      'number.min': 'Minimum price order cannot be negative'
    }),
  Tags: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({
      'array.base': 'Tags must be an array',
      'array.includes': 'Each tag must be a string'
    }),
  CateringImage: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Catering image must be a string',
      'string.max': 'Catering image path cannot exceed 500 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1)
  .messages({
    'object.min': 'At least one field must be provided for update'
  });

const getCateringByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Catering ID must be a valid ObjectId or positive number',
      'string.empty': 'Catering ID is required'
    })
});

const getAllCateringsSchema = Joi.object({
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
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Catering_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Type ID must be a number',
      'number.integer': 'Catering Type ID must be an integer',
      'number.positive': 'Catering Type ID must be a positive number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('Name', 'Reating', 'MinPriceOrder', 'created_at', 'updated_at', 'Catering_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Name, Reating, MinPriceOrder, created_at, updated_at, Catering_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getCateringsByTypeIdParamsSchema = Joi.object({
  Catering_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Type ID must be a number',
      'number.integer': 'Catering Type ID must be an integer',
      'number.positive': 'Catering Type ID must be a positive number',
      'any.required': 'Catering Type ID is required'
    })
});

const getCateringsByTypeIdQuerySchema = Joi.object({
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
    .max(200)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('Name', 'Reating', 'MinPriceOrder', 'created_at', 'updated_at', 'Catering_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Name, Reating, MinPriceOrder, created_at, updated_at, Catering_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const getCateringsByAuthSchema = Joi.object({
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  Catering_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Type ID must be a number',
      'number.integer': 'Catering Type ID must be an integer',
      'number.positive': 'Catering Type ID must be a positive number'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('Name', 'Reating', 'MinPriceOrder', 'created_at', 'updated_at', 'Catering_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Name, Reating, MinPriceOrder, created_at, updated_at, Catering_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCateringSchema,
  updateCateringSchema,
  getCateringByIdSchema,
  getAllCateringsSchema,
  getCateringsByTypeIdParamsSchema,
  getCateringsByTypeIdQuerySchema,
  getCateringsByAuthSchema
};

