const Joi = require('joi');

const createPrinterOrderSchema = Joi.object({
  Printer_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Printer ID must be a number',
      'number.integer': 'Printer ID must be an integer',
      'number.positive': 'Printer ID must be positive',
      'any.required': 'Printer ID is required'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be positive',
      'any.required': 'Branch ID is required'
    }),
  orderStatus: Joi.string()
    .valid('Pending', 'Process', 'Done')
    .default('Pending')
    .optional()
    .messages({
      'any.only': 'Order status must be one of: Pending, Process, Done'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updatePrinterOrderSchema = Joi.object({
  Printer_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Printer ID must be a number',
      'number.integer': 'Printer ID must be an integer',
      'number.positive': 'Printer ID must be positive'
    }),
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be positive'
    }),
  orderStatus: Joi.string()
    .valid('Pending', 'Process', 'Done')
    .optional()
    .messages({
      'any.only': 'Order status must be one of: Pending, Process, Done'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getPrinterOrderByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Printer order ID must be a valid ObjectId or positive number',
      'string.empty': 'Printer order ID is required'
    })
});

const getAllPrinterOrdersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  orderStatus: Joi.string()
    .valid('Pending', 'Process', 'Done')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Printer_Orders_id', 'orderStatus')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createPrinterOrderSchema,
  updatePrinterOrderSchema,
  getPrinterOrderByIdSchema,
  getAllPrinterOrdersSchema
};
