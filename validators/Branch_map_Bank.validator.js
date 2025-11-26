const Joi = require('joi');

const createBranchMapBankSchema = Joi.object({
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
  Bank_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
      'number.positive': 'Bank ID must be a positive number',
      'any.required': 'Bank ID is required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updateBranchMapBankSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  Bank_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
      'number.positive': 'Bank ID must be a positive number'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getBranchMapBankByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Branch map bank ID must be a valid ObjectId or positive number',
      'any.required': 'Branch map bank ID is required'
    })
});

const paginationQuery = {
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
  Branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number'
    }),
  Bank_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
      'number.positive': 'Bank ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Branch_map_Bank_id')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, Branch_map_Bank_id'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
};

const getAllBranchMapBankSchema = Joi.object({
  ...paginationQuery
});

const getBranchMapBankByAuthSchema = Joi.object({
  ...paginationQuery
});

const getBranchMapBankByBranchIdParamsSchema = Joi.object({
  Branch_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Branch ID must be a number',
      'number.integer': 'Branch ID must be an integer',
      'number.positive': 'Branch ID must be a positive number',
      'any.required': 'Branch ID is required'
    })
});

const getBranchMapBankByBranchIdQuerySchema = Joi.object({
  ...paginationQuery,
  Branch_id: Joi.forbidden()
}).messages({
  'any.unknown': 'Branch ID should be provided in the route parameter'
});

module.exports = {
  createBranchMapBankSchema,
  updateBranchMapBankSchema,
  getBranchMapBankByIdSchema,
  getAllBranchMapBankSchema,
  getBranchMapBankByAuthSchema,
  getBranchMapBankByBranchIdParamsSchema,
  getBranchMapBankByBranchIdQuerySchema
};


