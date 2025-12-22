const Joi = require('joi');

const createStorySchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  Discription: Joi.string().trim().max(5000).optional().allow('').messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: Joi.array().items(Joi.string().trim()).optional().default([]),
  emozi: Joi.string().trim().optional().allow(''),
  VideoUrl: Joi.array().items(Joi.string().trim()).optional().default([]),
  Coverimage: Joi.string().trim().optional().allow(''),
  Songs: Joi.string().trim().optional().allow(''),
  capiton: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  hashtag: Joi.string().trim().optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateStorySchema = Joi.object({
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title cannot exceed 200 characters'
  }),
  Discription: Joi.string().trim().max(5000).optional().allow('').messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: Joi.array().items(Joi.string().trim()).optional(),
  emozi: Joi.string().trim().optional().allow(''),
  VideoUrl: Joi.array().items(Joi.string().trim()).optional(),
  Coverimage: Joi.string().trim().optional().allow(''),
  Songs: Joi.string().trim().optional().allow(''),
  capiton: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'Caption cannot exceed 1000 characters'
  }),
  hashtag: Joi.string().trim().optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getStoryByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllStoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Real_Post_id', 'title').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getStoriesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Real_Post_id', 'title').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createStorySchema,
  updateStorySchema,
  getStoryByIdSchema,
  getAllStoriesSchema,
  getStoriesByAuthSchema
};

