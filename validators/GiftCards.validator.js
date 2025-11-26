const Joi = require('joi');

const createGiftCardSchema = Joi.object({
  GiftCards_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Gift card type ID must be a number',
      'number.integer': 'Gift card type ID must be an integer',
      'number.positive': 'Gift card type ID must be a positive number',
      'any.required': 'Gift card type ID is required'
    }),
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
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image path cannot exceed 500 characters'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  expiryDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Expiry days must be a number',
      'number.integer': 'Expiry days must be an integer',
      'number.min': 'Expiry days cannot be negative'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

const updateGiftCardSchema = Joi.object({
  GiftCards_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Gift card type ID must be a number',
      'number.integer': 'Gift card type ID must be an integer',
      'number.positive': 'Gift card type ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(''),
  price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  Description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow(''),
  expiryDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Expiry days must be a number',
      'number.integer': 'Expiry days must be an integer',
      'number.min': 'Expiry days cannot be negative'
    }),
  Status: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getGiftCardByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Gift card ID must be a valid ObjectId or positive number',
      'string.empty': 'Gift card ID is required'
    })
});

const getAllGiftCardsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  GiftCards_type_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  minPrice: Joi.number()
    .min(0)
    .optional(),
  maxPrice: Joi.number()
    .min(0)
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'name', 'price', 'expiryDays')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

const getGiftCardsByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  GiftCards_type_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'name', 'price', 'expiryDays')
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
});

module.exports = {
  createGiftCardSchema,
  updateGiftCardSchema,
  getGiftCardByIdSchema,
  getAllGiftCardsSchema,
  getGiftCardsByAuthSchema
};


