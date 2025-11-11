const Joi = require('joi');

/**
 * ProfilePage validation schemas using Joi
 */

// ProfileInfo schema
const profileInfoSchema = Joi.object({
  Title: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
  Description: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  Emozi: Joi.string()
    .trim()
    .optional()
    .allow('')
});

// Create profile page validation schema
const createProfilePageSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  PageType: Joi.string()
    .valid('Personal', 'Professional')
    .required()
    .messages({
      'any.only': 'PageType must be either Personal or Professional',
      'any.required': 'PageType is required'
    }),
  ProfileImage: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'ProfileImage must be a valid URL'
    }),
  Name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  ProfileInfo: Joi.array()
    .items(profileInfoSchema)
    .optional()
    .default([])
    .messages({
      'array.base': 'ProfileInfo must be an array'
    }),
  Category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  pageCover_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Page cover image must be a valid URL'
    }),
  inviteFriends_id: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
    .messages({
      'array.base': 'Invite friends ID must be an array',
      'number.base': 'Each friend ID must be a number',
      'number.integer': 'Each friend ID must be an integer',
      'number.positive': 'Each friend ID must be a positive number'
    }),
  PageNotification: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'PageNotification must be a boolean value'
    }),
  MarketingPromotionalEmails: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'MarketingPromotionalEmails must be a boolean value'
    }),
  Status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update profile page validation schema
const updateProfilePageSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.positive': 'User ID must be a positive number'
    }),
  PageType: Joi.string()
    .valid('Personal', 'Professional')
    .optional()
    .messages({
      'any.only': 'PageType must be either Personal or Professional'
    }),
  ProfileImage: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'ProfileImage must be a valid URL'
    }),
  Name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  ProfileInfo: Joi.array()
    .items(profileInfoSchema)
    .optional()
    .messages({
      'array.base': 'ProfileInfo must be an array'
    }),
  Category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  pageCover_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Page cover image must be a valid URL'
    }),
  inviteFriends_id: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Invite friends ID must be an array',
      'number.base': 'Each friend ID must be a number',
      'number.integer': 'Each friend ID must be an integer',
      'number.positive': 'Each friend ID must be a positive number'
    }),
  PageNotification: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'PageNotification must be a boolean value'
    }),
  MarketingPromotionalEmails: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'MarketingPromotionalEmails must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get profile page by ID validation schema
const getProfilePageByIdSchema = Joi.object({
  id: Joi.alternatives()
    .try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
      Joi.string().pattern(/^\d+$/), // Number as string
      Joi.number().integer().positive() // Number directly
    )
    .required()
    .messages({
      'alternatives.match': 'Profile Page ID must be a valid ObjectId or positive number',
      'string.empty': 'Profile Page ID is required'
    })
});

// Get all profile pages validation schema
const getAllProfilePagesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .optional()
    .allow(''),
  status: Joi.string()
    .valid('true', 'false')
    .optional(),
  PageType: Joi.string()
    .valid('Personal', 'Professional')
    .optional(),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  Category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'Name', 'ProfilePage_id')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

module.exports = {
  createProfilePageSchema,
  updateProfilePageSchema,
  getProfilePageByIdSchema,
  getAllProfilePagesSchema
};

