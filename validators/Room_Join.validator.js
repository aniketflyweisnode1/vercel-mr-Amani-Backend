const Joi = require('joi');

const createRoomJoinSchema = Joi.object({
  Room_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Room ID must be a number',
    'number.positive': 'Room ID must be a positive number',
    'any.required': 'Room ID is required'
  }),
  join_by: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().default(true).optional()
});

const updateRoomJoinSchema = Joi.object({
  Room_id: Joi.number().integer().positive().optional(),
  join_by: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRoomJoinByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().pattern(/^\d+$/),
      Joi.number().integer().positive()
    )
    .required()
    .messages({
      'alternatives.match': 'Room Join ID must be a valid ObjectId or positive number',
      'string.empty': 'Room Join ID is required'
    })
});

const getAllRoomJoinsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getRoomJoinsByRoomIdSchema = Joi.object({
  roomId: Joi.number().integer().positive().required().messages({
    'number.base': 'Room ID must be a number',
    'number.positive': 'Room ID must be a positive number',
    'any.required': 'Room ID is required'
  }),
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createRoomJoinSchema,
  updateRoomJoinSchema,
  getRoomJoinByIdSchema,
  getAllRoomJoinsSchema,
  getRoomJoinsByRoomIdSchema
};

