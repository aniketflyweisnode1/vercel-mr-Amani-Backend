const Joi = require('joi');

const createPlanSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Plan name is required',
      'string.min': 'Plan name must be at least 2 characters long',
      'string.max': 'Plan name cannot exceed 200 characters'
    }),
  FistfreeDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'First free days must be a number',
      'number.integer': 'First free days must be an integer',
      'number.min': 'First free days cannot be negative'
    }),
  Price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  PlanDurectionDay: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Plan duration days must be a number',
      'number.integer': 'Plan duration days must be an integer',
      'number.min': 'Plan duration must be at least 1 day',
      'any.required': 'Plan duration days is required'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

const updatePlanSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Plan name must be at least 2 characters long',
      'string.max': 'Plan name cannot exceed 200 characters'
    }),
  FistfreeDays: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'First free days must be a number',
      'number.integer': 'First free days must be an integer',
      'number.min': 'First free days cannot be negative'
    }),
  Price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  PlanDurectionDay: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Plan duration days must be a number',
      'number.integer': 'Plan duration days must be an integer',
      'number.min': 'Plan duration must be at least 1 day'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getPlanByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Plan ID must be a valid ObjectId or positive number',
      'string.empty': 'Plan ID is required'
    })
});

const getAllPlansSchema = Joi.object({
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
    .valid('created_at', 'updated_at', 'name', 'Price')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

const getPlansByAuthSchema = Joi.object({
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
    .valid('created_at', 'updated_at', 'name', 'Price')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createPlanSchema,
  updatePlanSchema,
  getPlanByIdSchema,
  getAllPlansSchema,
  getPlansByAuthSchema
};

