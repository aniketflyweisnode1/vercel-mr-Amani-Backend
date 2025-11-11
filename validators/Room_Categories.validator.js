const Joi = require('joi');

const createRoomCategorySchema = Joi.object({
  name: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Name is required',
    'string.max': 'Name cannot exceed 200 characters'
  }),
  Discription: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: Joi.string().trim().optional(),
  emozi: Joi.string().trim().optional(),
  Status: Joi.boolean().default(true).optional()
});

const updateRoomCategorySchema = Joi.object({
  name: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Name cannot exceed 200 characters'
  }),
  Discription: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  image: Joi.string().trim().optional(),
  emozi: Joi.string().trim().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRoomCategoryByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Room Category ID must be a valid ObjectId or positive number',
      'string.empty': 'Room Category ID is required'
    })
});

const getAllRoomCategoriesSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createRoomCategorySchema,
  updateRoomCategorySchema,
  getRoomCategoryByIdSchema,
  getAllRoomCategoriesSchema
};

