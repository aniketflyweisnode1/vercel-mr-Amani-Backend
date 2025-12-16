const Joi = require('joi');

const searchStoresSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required'
  }),
  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required'
  })
});

const orderItemSchema = Joi.object({
  product_id: Joi.string().trim().min(1).required().messages({
    'string.base': 'Product ID must be a string',
    'string.empty': 'Product ID cannot be empty',
    'string.min': 'Product ID must be at least 1 character',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  })
});

const createOrderSchema = Joi.object({
  place_order: Joi.boolean().optional().default(false).messages({
    'boolean.base': 'place_order must be a boolean'
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'array.base': 'Items must be an array',
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  })
});

module.exports = {
  searchStoresSchema,
  createOrderSchema
};
