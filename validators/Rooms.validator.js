const Joi = require('joi');

const createRoomSchema = Joi.object({
  Room_Categories_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Room Category ID must be a number',
    'number.positive': 'Room Category ID must be a positive number',
    'any.required': 'Room Category ID is required'
  }),
  RoomName: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Room name is required',
    'string.max': 'Room name cannot exceed 200 characters'
  }),
  RoomType: Joi.string().valid('Private', 'Family', 'Friends', 'Everyone').required().default('Everyone').messages({
    'any.only': 'Room type must be one of: Private, Family, Friends, Everyone',
    'any.required': 'Room type is required'
  }),
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title cannot exceed 200 characters'
  }),
  Description: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  CoverImage: Joi.string().trim().optional(),
  url: Joi.string().trim().optional(),
  emozi: Joi.string().trim().optional(),
  Status: Joi.boolean().default(true).optional()
});

const updateRoomSchema = Joi.object({
  Room_Categories_id: Joi.number().integer().positive().optional(),
  RoomName: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Room name cannot exceed 200 characters'
  }),
  RoomType: Joi.string().valid('Private', 'Family', 'Friends', 'Everyone').optional().messages({
    'any.only': 'Room type must be one of: Private, Family, Friends, Everyone'
  }),
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title cannot exceed 200 characters'
  }),
  Description: Joi.string().trim().max(5000).optional().messages({
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  CoverImage: Joi.string().trim().optional(),
  url: Joi.string().trim().optional(),
  emozi: Joi.string().trim().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRoomByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Room ID must be a valid ObjectId or positive number',
      'string.empty': 'Room ID is required'
    })
});

const getAllRoomsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  roomType: Joi.string().valid('Private', 'Family', 'Friends', 'Everyone').optional(),
  roomCategoryId: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getRoomsByRoomCategoryIdSchema = Joi.object({
  roomCategoryId: Joi.number().integer().positive().required().messages({
    'number.base': 'Room Category ID must be a number',
    'number.positive': 'Room Category ID must be a positive number',
    'any.required': 'Room Category ID is required'
  }),
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createRoomSchema,
  updateRoomSchema,
  getRoomByIdSchema,
  getAllRoomsSchema,
  getRoomsByRoomCategoryIdSchema
};

