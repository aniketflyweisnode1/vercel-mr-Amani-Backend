const Joi = require('joi');

const createPrinterSchema = Joi.object({
  PrinterName: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Printer name is required',
      'string.min': 'Printer name must be at least 1 character long',
      'string.max': 'Printer name cannot exceed 200 characters',
      'any.required': 'Printer name is required'
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
  Printer_type: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Printer type must be a number',
      'number.integer': 'Printer type must be an integer',
      'number.positive': 'Printer type must be positive',
      'any.required': 'Printer type is required'
    }),
  IpAddress: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'IP address cannot exceed 50 characters'
    }),
  Port: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Port cannot exceed 10 characters'
    }),
  onlineStatus: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'Online status must be a boolean value'
    }),
  PaperStatus: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Paper status cannot exceed 100 characters'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updatePrinterSchema = Joi.object({
  PrinterName: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Printer name must be at least 1 character long',
      'string.max': 'Printer name cannot exceed 200 characters'
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
  Printer_type: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Printer type must be a number',
      'number.integer': 'Printer type must be an integer',
      'number.positive': 'Printer type must be positive'
    }),
  IpAddress: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'IP address cannot exceed 50 characters'
    }),
  Port: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Port cannot exceed 10 characters'
    }),
  onlineStatus: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Online status must be a boolean value'
    }),
  PaperStatus: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Paper status cannot exceed 100 characters'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getPrinterByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Printer ID must be a valid ObjectId or positive number',
      'string.empty': 'Printer ID is required'
    })
});

const getAllPrintersSchema = Joi.object({
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
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Printer_id', 'PrinterName')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getPrintersByTypeIdParamsSchema = Joi.object({
  type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Printer type ID must be a number',
      'number.integer': 'Printer type ID must be an integer',
      'number.positive': 'Printer type ID must be positive',
      'any.required': 'Printer type ID is required'
    })
});

const getPrintersByTypeIdQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Printer_id', 'PrinterName')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getPrintersByAuthSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Printer_id', 'PrinterName')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getPrinterDashboardSchema = Joi.object({
  branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be positive',
      'any.required': 'Branch ID is required'
    })
});

module.exports = {
  createPrinterSchema,
  updatePrinterSchema,
  getPrinterByIdSchema,
  getAllPrintersSchema,
  getPrintersByTypeIdParamsSchema,
  getPrintersByTypeIdQuerySchema,
  getPrintersByAuthSchema,
  getPrinterDashboardSchema
};
