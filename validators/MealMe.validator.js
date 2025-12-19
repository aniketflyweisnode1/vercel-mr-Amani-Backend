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

const searchProductsSchema = Joi.object({
  query: Joi.string().trim().optional().allow(''),
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
  }),
  distance: Joi.string().trim().optional().pattern(/^\d+(mi|km)$/).messages({
    'string.pattern.base': 'Distance must be in format like "10mi" or "5km"'
  }),
  merchantId: Joi.string().trim().optional(),
  category: Joi.string().trim().optional()
});

const createCartSchema = Joi.object({
  location_id: Joi.string().trim().required().messages({
    'string.base': 'location_id must be a string',
    'string.empty': 'location_id cannot be empty',
    'any.required': 'location_id is required'
  }),
  user_id: Joi.string().trim().required().messages({
    'string.base': 'user_id must be a string',
    'string.empty': 'user_id cannot be empty',
    'any.required': 'user_id is required'
  }),
  status: Joi.string().trim().optional().default('Active')
});

const addItemToCartSchema = Joi.object({
  product_id: Joi.string().trim().required().messages({
    'string.base': 'product_id must be a string',
    'string.empty': 'product_id cannot be empty',
    'any.required': 'product_id is required'
  }),
  product_name: Joi.string().trim().optional(),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  })
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  })
});

const addressSchema = Joi.object({
  street_address: Joi.string().trim().optional(),
  street_address_detail: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  region: Joi.string().trim().optional(),
  postal_code: Joi.string().trim().optional(),
  country: Joi.string().trim().optional()
});

const customerSchema = Joi.object({
  id: Joi.string().trim().required().messages({
    'string.base': 'Customer ID must be a string',
    'string.empty': 'Customer ID cannot be empty',
    'any.required': 'Customer ID is required'
  }),
  name: Joi.string().trim().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address'
  }),
  phone_number: Joi.string().trim().optional(),
  address: addressSchema.optional()
});

const orderItemV2Schema = Joi.object({
  product_id: Joi.string().trim().required().messages({
    'string.base': 'Product ID must be a string',
    'string.empty': 'Product ID cannot be empty',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  })
});

const createOrderV2Schema = Joi.object({
  location_id: Joi.string().trim().required().messages({
    'string.base': 'location_id must be a string',
    'string.empty': 'location_id cannot be empty',
    'any.required': 'location_id is required'
  }),
  fulfillment_method: Joi.string().trim().required().messages({
    'string.base': 'fulfillment_method must be a string',
    'string.empty': 'fulfillment_method cannot be empty',
    'any.required': 'fulfillment_method is required'
  }),
  customer: customerSchema.required().messages({
    'any.required': 'customer object is required'
  }),
  items: Joi.array().items(orderItemV2Schema).min(1).required().messages({
    'array.base': 'Items must be an array',
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  }),
  tip: Joi.number().min(0).optional(),
  dropoff_instructions: Joi.string().trim().optional().allow('')
});

const submitOrderSchema = Joi.object({
  payment_method_id: Joi.string().trim().required().messages({
    'string.base': 'payment_method_id must be a string',
    'string.empty': 'payment_method_id cannot be empty',
    'any.required': 'payment_method_id is required'
  })
});

const orderIdParamSchema = Joi.object({
  orderId: Joi.string().trim().required().messages({
    'string.base': 'Order ID must be a string',
    'string.empty': 'Order ID cannot be empty',
    'any.required': 'Order ID is required'
  })
});

const cartIdParamSchema = Joi.object({
  cartId: Joi.string().trim().required().messages({
    'string.base': 'Cart ID must be a string',
    'string.empty': 'Cart ID cannot be empty',
    'any.required': 'Cart ID is required'
  })
});

const itemIdParamSchema = Joi.object({
  itemId: Joi.string().trim().required().messages({
    'string.base': 'Item ID must be a string',
    'string.empty': 'Item ID cannot be empty',
    'any.required': 'Item ID is required'
  })
});

const cartItemParamsSchema = Joi.object({
  cartId: Joi.string().trim().required().messages({
    'string.base': 'Cart ID must be a string',
    'string.empty': 'Cart ID cannot be empty',
    'any.required': 'Cart ID is required'
  }),
  itemId: Joi.string().trim().required().messages({
    'string.base': 'Item ID must be a string',
    'string.empty': 'Item ID cannot be empty',
    'any.required': 'Item ID is required'
  })
});

module.exports = {
  searchStoresSchema,
  createOrderSchema,
  searchProductsSchema,
  createCartSchema,
  addItemToCartSchema,
  updateCartItemSchema,
  createOrderV2Schema,
  submitOrderSchema,
  orderIdParamSchema,
  cartIdParamSchema,
  itemIdParamSchema,
  cartItemParamsSchema
};
