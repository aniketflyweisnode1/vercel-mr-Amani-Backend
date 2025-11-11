const Joi = require('joi');

const createNotificationTypeSchema = Joi.object({
  name: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Name is required',
    'string.max': 'Name cannot exceed 200 characters'
  }),
  emozi: Joi.string().trim().max(50).optional().allow('').messages({
    'string.max': 'Emozi cannot exceed 50 characters'
  }),
  Status: Joi.boolean().optional()
});

const updateNotificationTypeSchema = Joi.object({
  name: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Name cannot exceed 200 characters'
  }),
  emozi: Joi.string().trim().max(50).optional().allow('').messages({
    'string.max': 'Emozi cannot exceed 50 characters'
  }),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getNotificationTypeByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required().messages({
    'alternatives.match': 'Notification type ID must be a valid ObjectId or positive number',
    'string.empty': 'Notification type ID is required'
  })
});

const getAllNotificationTypesSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Notification_type_id', 'name').optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createNotificationTypeSchema,
  updateNotificationTypeSchema,
  getNotificationTypeByIdSchema,
  getAllNotificationTypesSchema
};
