const Joi = require('joi');

const createVendorFlashSaleSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Vendor Store ID must be a number',
    'number.integer': 'Vendor Store ID must be an integer',
    'number.positive': 'Vendor Store ID must be a positive number',
    'any.required': 'Vendor Store ID is required'
  }),
  Vendor_Product_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Vendor Product ID must be a number',
    'number.integer': 'Vendor Product ID must be an integer',
    'number.positive': 'Vendor Product ID must be a positive number',
    'any.required': 'Vendor Product ID is required'
  }),
  SaleDate: Joi.date().required().messages({
    'date.base': 'Sale date must be a valid date',
    'any.required': 'Sale date is required'
  }),
  StartTime: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).messages({
      'string.pattern.base': 'Start time must be in format "HH:MM AM/PM" (e.g., "12:01 AM", "11:30 PM")'
    })
  ).required().messages({
    'any.required': 'Start time is required',
    'alternatives.match': 'Start time must be a valid date or time string in format "HH:MM AM/PM"'
  }),
  EndTime: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).messages({
      'string.pattern.base': 'End time must be in format "HH:MM AM/PM" (e.g., "12:00 PM", "11:59 PM")'
    })
  ).required().messages({
    'any.required': 'End time is required',
    'alternatives.match': 'End time must be a valid date or time string in format "HH:MM AM/PM"'
  }),
  Status: Joi.boolean().optional().default(true).messages({
    'boolean.base': 'Status must be a boolean'
  })
});

const updateVendorFlashSaleSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Vendor Store ID must be a number',
    'number.integer': 'Vendor Store ID must be an integer',
    'number.positive': 'Vendor Store ID must be a positive number'
  }),
  Vendor_Product_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Vendor Product ID must be a number',
    'number.integer': 'Vendor Product ID must be an integer',
    'number.positive': 'Vendor Product ID must be a positive number'
  }),
  SaleDate: Joi.date().optional().messages({
    'date.base': 'Sale date must be a valid date'
  }),
  StartTime: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).messages({
      'string.pattern.base': 'Start time must be in format "HH:MM AM/PM" (e.g., "12:01 AM", "11:30 PM")'
    })
  ).optional().messages({
    'alternatives.match': 'Start time must be a valid date or time string in format "HH:MM AM/PM"'
  }),
  EndTime: Joi.alternatives().try(
    Joi.date(),
    Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).messages({
      'string.pattern.base': 'End time must be in format "HH:MM AM/PM" (e.g., "12:00 PM", "11:59 PM")'
    })
  ).optional().messages({
    'alternatives.match': 'End time must be a valid date or time string in format "HH:MM AM/PM"'
  }),
  Status: Joi.boolean().optional().messages({
    'boolean.base': 'Status must be a boolean'
  })
});

const getVendorFlashSaleByIdSchema = Joi.object({
  id: Joi.string().trim().min(1).required().messages({
    'string.base': 'Vendor Flash Sale ID must be a string',
    'string.empty': 'Vendor Flash Sale ID cannot be empty',
    'any.required': 'Vendor Flash Sale ID is required'
  })
});

const getAllVendorFlashSalesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().trim().optional().default('').messages({
    'string.base': 'Search must be a string'
  }),
  status: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'Status must be either "true" or "false"'
  }),
  Vendor_Store_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Vendor Store ID must be a number',
    'number.integer': 'Vendor Store ID must be an integer',
    'number.positive': 'Vendor Store ID must be a positive number'
  }),
  Vendor_Product_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Vendor Product ID must be a number',
    'number.integer': 'Vendor Product ID must be an integer',
    'number.positive': 'Vendor Product ID must be a positive number'
  }),
  sortBy: Joi.string().trim().optional().default('created_at').messages({
    'string.base': 'Sort by must be a string'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either "asc" or "desc"'
  })
});

const getVendorFlashSalesByProductIdParamsSchema = Joi.object({
  Vendor_Product_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Vendor Product ID must be a number',
    'number.integer': 'Vendor Product ID must be an integer',
    'number.positive': 'Vendor Product ID must be a positive number',
    'any.required': 'Vendor Product ID is required'
  })
});

const getVendorFlashSalesByProductIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().trim().optional().default('').messages({
    'string.base': 'Search must be a string'
  }),
  status: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'Status must be either "true" or "false"'
  }),
  sortBy: Joi.string().trim().optional().default('created_at').messages({
    'string.base': 'Sort by must be a string'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either "asc" or "desc"'
  })
});

const getVendorFlashSalesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().trim().optional().default('').messages({
    'string.base': 'Search must be a string'
  }),
  status: Joi.string().valid('true', 'false').optional().messages({
    'any.only': 'Status must be either "true" or "false"'
  }),
  sortBy: Joi.string().trim().optional().default('created_at').messages({
    'string.base': 'Sort by must be a string'
  }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either "asc" or "desc"'
  })
});

module.exports = {
  createVendorFlashSaleSchema,
  updateVendorFlashSaleSchema,
  getVendorFlashSaleByIdSchema,
  getAllVendorFlashSalesSchema,
  getVendorFlashSalesByProductIdParamsSchema,
  getVendorFlashSalesByProductIdQuerySchema,
  getVendorFlashSalesByAuthSchema
};
