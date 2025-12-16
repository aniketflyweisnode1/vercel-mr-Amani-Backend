const Joi = require('joi');

const getLoginUrlSchema = Joi.object({
  scope: Joi.string().trim().optional().default('profile.read channel.read event.read').messages({
    'string.base': 'Scope must be a string'
  }),
  state: Joi.string().trim().optional().messages({
    'string.base': 'State must be a string'
  })
});

const oauthCallbackSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    'string.base': 'Authorization code must be a string',
    'string.empty': 'Authorization code cannot be empty',
    'any.required': 'Authorization code is required'
  }),
  state: Joi.string().trim().optional().messages({
    'string.base': 'State must be a string'
  }),
  error: Joi.string().trim().optional().messages({
    'string.base': 'Error must be a string'
  })
});

const callAPISchema = Joi.object({
  endpoint: Joi.string().trim().min(1).required().messages({
    'string.base': 'Endpoint must be a string',
    'string.empty': 'Endpoint cannot be empty',
    'string.min': 'Endpoint must be at least 1 character',
    'any.required': 'Endpoint is required'
  }),
  method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').optional().default('GET').messages({
    'string.base': 'Method must be a string',
    'any.only': 'Method must be one of: GET, POST, PUT, DELETE, PATCH'
  }),
  body: Joi.object().optional().messages({
    'object.base': 'Body must be an object'
  })
});

module.exports = {
  getLoginUrlSchema,
  oauthCallbackSchema,
  callAPISchema
};
