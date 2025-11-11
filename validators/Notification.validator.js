const Joi = require('joi');

const createNotificationSchema = Joi.object({
  Notification_type_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Notification_type_id must be a number',
    'number.integer': 'Notification_type_id must be an integer',
    'number.positive': 'Notification_type_id must be a positive number',
    'any.required': 'Notification_type_id is required'
  }),
  user_id: Joi.number().integer().positive().required().messages({
    'number.base': 'user_id must be a number',
    'number.integer': 'user_id must be an integer',
    'number.positive': 'user_id must be a positive number',
    'any.required': 'user_id is required'
  }),
  Notification: Joi.string().trim().max(1000).required().messages({
    'string.empty': 'Notification message is required',
    'string.max': 'Notification cannot exceed 1000 characters'
  }),
  routes: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Routes cannot exceed 500 characters'
  }),
  isRead: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

const updateNotificationSchema = Joi.object({
  Notification_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Notification_type_id must be a number',
    'number.integer': 'Notification_type_id must be an integer',
    'number.positive': 'Notification_type_id must be a positive number'
  }),
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'user_id must be a number',
    'number.integer': 'user_id must be an integer',
    'number.positive': 'user_id must be a positive number'
  }),
  Notification: Joi.string().trim().max(1000).optional().messages({
    'string.max': 'Notification cannot exceed 1000 characters'
  }),
  routes: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Routes cannot exceed 500 characters'
  }),
  isRead: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getNotificationByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required().messages({
    'alternatives.match': 'Notification ID must be a valid ObjectId or positive number',
    'string.empty': 'Notification ID is required'
  })
});

const getAllNotificationsSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  search: Joi.string().trim().optional().allow(''),
  status: Joi.string().valid('true', 'false').optional(),
  user_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'user_id must be a number',
    'number.integer': 'user_id must be an integer',
    'number.positive': 'user_id must be a positive number'
  }),
  Notification_type_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Notification_type_id must be a number',
    'number.integer': 'Notification_type_id must be an integer',
    'number.positive': 'Notification_type_id must be a positive number'
  }),
  isRead: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Notification_id').optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

const getNotificationsByAuthSchema = Joi.object({
  page: Joi.number().integer().positive().optional().default(1),
  limit: Joi.number().integer().positive().max(100).optional().default(10),
  status: Joi.string().valid('true', 'false').optional(),
  isRead: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Notification_id').optional().default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

module.exports = {
  createNotificationSchema,
  updateNotificationSchema,
  getNotificationByIdSchema,
  getAllNotificationsSchema,
  getNotificationsByAuthSchema
};
