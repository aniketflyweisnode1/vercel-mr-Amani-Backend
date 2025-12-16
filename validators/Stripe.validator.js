const Joi = require('joi');

const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be a positive number',
    'any.required': 'Amount is required'
  }),
  currency: Joi.string().trim().length(3).uppercase().optional().default('USD').messages({
    'string.base': 'Currency must be a string',
    'string.length': 'Currency must be a 3-letter code (e.g., USD, EUR)'
  }),
  customerEmail: Joi.string().trim().email().optional().messages({
    'string.email': 'Customer email must be a valid email address'
  }),
  billingDetails: Joi.object().optional().messages({
    'object.base': 'Billing details must be an object'
  }),
  metadata: Joi.object().optional().messages({
    'object.base': 'Metadata must be an object'
  })
});

const getPaymentIntentByIdSchema = Joi.object({
  id: Joi.string().trim().min(1).required().messages({
    'string.base': 'Payment intent ID must be a string',
    'string.empty': 'Payment intent ID cannot be empty',
    'any.required': 'Payment intent ID is required'
  })
});

const confirmPaymentIntentSchema = Joi.object({
  paymentIntentId: Joi.string().trim().min(1).required().messages({
    'string.base': 'Payment intent ID must be a string',
    'string.empty': 'Payment intent ID cannot be empty',
    'any.required': 'Payment intent ID is required'
  }),
  paymentMethodId: Joi.string().trim().optional().messages({
    'string.base': 'Payment method ID must be a string'
  })
});

const cancelPaymentIntentSchema = Joi.object({
  paymentIntentId: Joi.string().trim().min(1).required().messages({
    'string.base': 'Payment intent ID must be a string',
    'string.empty': 'Payment intent ID cannot be empty',
    'any.required': 'Payment intent ID is required'
  })
});

const createCustomerSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  name: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Name cannot exceed 200 characters'
  }),
  phone: Joi.string().trim().optional().messages({
    'string.base': 'Phone must be a string'
  }),
  metadata: Joi.object().optional().messages({
    'object.base': 'Metadata must be an object'
  })
});

const createRefundSchema = Joi.object({
  paymentIntentId: Joi.string().trim().min(1).required().messages({
    'string.base': 'Payment intent ID must be a string',
    'string.empty': 'Payment intent ID cannot be empty',
    'any.required': 'Payment intent ID is required'
  }),
  amount: Joi.number().positive().optional().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be a positive number'
  }),
  reason: Joi.string().valid('duplicate', 'fraudulent', 'requested_by_customer').optional().default('requested_by_customer').messages({
    'any.only': 'Reason must be one of: duplicate, fraudulent, requested_by_customer'
  })
});

const verifyPaymentStatusSchema = Joi.object({
  clientSecret: Joi.string().trim().min(1).required().messages({
    'string.base': 'Client secret must be a string',
    'string.empty': 'Client secret cannot be empty',
    'any.required': 'Client secret is required'
  })
});

const webhookSchema = Joi.object({
  webhookSecret: Joi.string().trim().optional().messages({
    'string.base': 'Webhook secret must be a string'
  })
}).unknown(true); // Allow unknown fields for webhook payload

module.exports = {
  createPaymentIntentSchema,
  getPaymentIntentByIdSchema,
  confirmPaymentIntentSchema,
  cancelPaymentIntentSchema,
  createCustomerSchema,
  createRefundSchema,
  verifyPaymentStatusSchema,
  webhookSchema
};
