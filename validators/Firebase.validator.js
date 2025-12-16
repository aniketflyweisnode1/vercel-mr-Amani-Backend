const Joi = require('joi');

const sendTestNotificationSchema = Joi.object({
  token: Joi.string().trim().min(1).required().messages({
    'string.base': 'FCM device token must be a string',
    'string.empty': 'FCM device token cannot be empty',
    'any.required': 'FCM device token is required'
  }),
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Notification title cannot exceed 200 characters'
  }),
  body: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Notification body cannot exceed 500 characters'
  }),
  imageUrl: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  data: Joi.object().optional().messages({
    'object.base': 'Data must be an object'
  })
});

const sendNotificationSchema = Joi.object({
  token: Joi.string().trim().min(1).required().messages({
    'string.base': 'FCM device token must be a string',
    'string.empty': 'FCM device token cannot be empty',
    'any.required': 'FCM device token is required'
  }),
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'Notification title must be a string',
    'string.empty': 'Notification title cannot be empty',
    'string.max': 'Notification title cannot exceed 200 characters',
    'any.required': 'Notification title is required'
  }),
  body: Joi.string().trim().min(1).max(500).required().messages({
    'string.base': 'Notification body must be a string',
    'string.empty': 'Notification body cannot be empty',
    'string.max': 'Notification body cannot exceed 500 characters',
    'any.required': 'Notification body is required'
  }),
  imageUrl: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  data: Joi.object().optional().messages({
    'object.base': 'Data must be an object'
  })
});

const sendMulticastNotificationSchema = Joi.object({
  tokens: Joi.array().items(Joi.string().trim().min(1)).min(1).max(500).required().messages({
    'array.base': 'Tokens must be an array',
    'array.min': 'Tokens array must contain at least one token',
    'array.max': 'Tokens array cannot exceed 500 tokens',
    'any.required': 'Tokens array is required'
  }),
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'Notification title must be a string',
    'string.empty': 'Notification title cannot be empty',
    'string.max': 'Notification title cannot exceed 200 characters',
    'any.required': 'Notification title is required'
  }),
  body: Joi.string().trim().min(1).max(500).required().messages({
    'string.base': 'Notification body must be a string',
    'string.empty': 'Notification body cannot be empty',
    'string.max': 'Notification body cannot exceed 500 characters',
    'any.required': 'Notification body is required'
  }),
  imageUrl: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  data: Joi.object().optional().messages({
    'object.base': 'Data must be an object'
  })
});

const sendTopicNotificationSchema = Joi.object({
  topic: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Topic name must be a string',
    'string.empty': 'Topic name cannot be empty',
    'string.max': 'Topic name cannot exceed 100 characters',
    'any.required': 'Topic name is required'
  }),
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.base': 'Notification title must be a string',
    'string.empty': 'Notification title cannot be empty',
    'string.max': 'Notification title cannot exceed 200 characters',
    'any.required': 'Notification title is required'
  }),
  body: Joi.string().trim().min(1).max(500).required().messages({
    'string.base': 'Notification body must be a string',
    'string.empty': 'Notification body cannot be empty',
    'string.max': 'Notification body cannot exceed 500 characters',
    'any.required': 'Notification body is required'
  }),
  imageUrl: Joi.string().trim().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  data: Joi.object().optional().messages({
    'object.base': 'Data must be an object'
  })
});

const subscribeToTopicSchema = Joi.object({
  tokens: Joi.array().items(Joi.string().trim().min(1)).min(1).max(1000).required().messages({
    'array.base': 'Tokens must be an array',
    'array.min': 'Tokens array must contain at least one token',
    'array.max': 'Tokens array cannot exceed 1000 tokens',
    'any.required': 'Tokens array is required'
  }),
  topic: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Topic name must be a string',
    'string.empty': 'Topic name cannot be empty',
    'string.max': 'Topic name cannot exceed 100 characters',
    'any.required': 'Topic name is required'
  })
});

const unsubscribeFromTopicSchema = Joi.object({
  tokens: Joi.array().items(Joi.string().trim().min(1)).min(1).max(1000).required().messages({
    'array.base': 'Tokens must be an array',
    'array.min': 'Tokens array must contain at least one token',
    'array.max': 'Tokens array cannot exceed 1000 tokens',
    'any.required': 'Tokens array is required'
  }),
  topic: Joi.string().trim().min(1).max(100).required().messages({
    'string.base': 'Topic name must be a string',
    'string.empty': 'Topic name cannot be empty',
    'string.max': 'Topic name cannot exceed 100 characters',
    'any.required': 'Topic name is required'
  })
});

module.exports = {
  sendTestNotificationSchema,
  sendNotificationSchema,
  sendMulticastNotificationSchema,
  sendTopicNotificationSchema,
  subscribeToTopicSchema,
  unsubscribeFromTopicSchema
};
