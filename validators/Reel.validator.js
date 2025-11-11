const Joi = require('joi');

const stringArraySchema = Joi.array().items(Joi.string().trim().allow('')).messages({
  'array.base': '{#label} must be an array',
  'string.base': '{#label} items must be strings'
});

const createReelSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  Discription: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: stringArraySchema.label('Image').optional().default([]),
  emozi: Joi.string().trim().optional(),
  VideoUrl: stringArraySchema.label('VideoUrl').optional().default([]),
  Coverimage: Joi.string().trim().optional(),
  Songs: Joi.string().trim().optional(),
  capiton: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  hashtag: Joi.string().trim().optional(),
  ReelType: Joi.string().valid('Post', 'Story').required().messages({
    'any.only': 'ReelType must be either Post or Story',
    'any.required': 'ReelType is required'
  }),
  Status: Joi.boolean().default(true).optional()
});

const updateReelSchema = Joi.object({
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title cannot exceed 200 characters'
  }),
  Discription: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: stringArraySchema.label('Image').optional(),
  emozi: Joi.string().trim().optional(),
  VideoUrl: stringArraySchema.label('VideoUrl').optional(),
  Coverimage: Joi.string().trim().optional(),
  Songs: Joi.string().trim().optional(),
  capiton: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  hashtag: Joi.string().trim().optional(),
  ReelType: Joi.string().valid('Post', 'Story').optional().messages({
    'any.only': 'ReelType must be either Post or Story'
  }),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getReelByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Reel ID must be a valid ObjectId or positive number',
      'string.empty': 'Reel ID is required'
    })
});

const getAllReelsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createReelSchema,
  updateReelSchema,
  getReelByIdSchema,
  getAllReelsSchema
};

