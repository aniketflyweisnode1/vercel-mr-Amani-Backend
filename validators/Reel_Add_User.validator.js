const Joi = require('joi');

const createReelAddUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.positive': 'User ID must be a positive number',
    'any.required': 'User ID is required'
  }),
  Reel_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Reel ID must be a number',
    'number.positive': 'Reel ID must be a positive number',
    'any.required': 'Reel ID is required'
  }),
  Status: Joi.boolean().default(true).optional()
});

const updateReelAddUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  Reel_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getReelAddUserByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Reel Add User ID must be a valid ObjectId or positive number',
      'string.empty': 'Reel Add User ID is required'
    })
});

const getAllReelAddUsersSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createReelAddUserSchema,
  updateReelAddUserSchema,
  getReelAddUserByIdSchema,
  getAllReelAddUsersSchema
};

