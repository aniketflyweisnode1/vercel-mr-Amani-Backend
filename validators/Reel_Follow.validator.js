const Joi = require('joi');

const createReelFollowSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Reel ID must be a number',
    'number.positive': 'Reel ID must be a positive number',
    'any.required': 'Reel ID is required'
  }),
  Follow_by: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().default(true).optional()
});

const updateReelFollowSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().optional(),
  Follow_by: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getReelFollowByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Reel Follow ID must be a valid ObjectId or positive number',
      'string.empty': 'Reel Follow ID is required'
    })
});

const getAllReelFollowsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getReelFollowsByReelIdSchema = Joi.object({
  reelId: Joi.number().integer().positive().required().messages({
    'number.base': 'Reel ID must be a number',
    'number.positive': 'Reel ID must be a positive number',
    'any.required': 'Reel ID is required'
  }),
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createReelFollowSchema,
  updateReelFollowSchema,
  getReelFollowByIdSchema,
  getAllReelFollowsSchema,
  getReelFollowsByReelIdSchema
};

