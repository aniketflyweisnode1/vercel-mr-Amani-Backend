const Joi = require('joi');

const createReelCommentSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Reel ID must be a number',
    'number.positive': 'Reel ID must be a positive number',
    'any.required': 'Reel ID is required'
  }),
  Comment_by: Joi.number().integer().positive().optional(),
  commentText: Joi.string().trim().max(2000).required().messages({
    'string.empty': 'Comment text is required',
    'string.max': 'Comment text cannot exceed 2000 characters'
  }),
  Status: Joi.boolean().default(true).optional()
});

const updateReelCommentSchema = Joi.object({
  Real_Post_id: Joi.number().integer().positive().optional(),
  Comment_by: Joi.number().integer().positive().optional(),
  commentText: Joi.string().trim().max(2000).optional().messages({
    'string.max': 'Comment text cannot exceed 2000 characters'
  }),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getReelCommentByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Reel Comment ID must be a valid ObjectId or positive number',
      'string.empty': 'Reel Comment ID is required'
    })
});

const getAllReelCommentsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getReelCommentsByReelIdSchema = Joi.object({
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
  createReelCommentSchema,
  updateReelCommentSchema,
  getReelCommentByIdSchema,
  getAllReelCommentsSchema,
  getReelCommentsByReelIdSchema
};

