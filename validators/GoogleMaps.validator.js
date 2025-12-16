const Joi = require('joi');

const geocodeSchema = Joi.object({
  address: Joi.string().trim().min(1).max(500).required().messages({
    'string.base': 'Address must be a string',
    'string.empty': 'Address cannot be empty',
    'string.min': 'Address must be at least 1 character',
    'string.max': 'Address cannot exceed 500 characters',
    'any.required': 'Address is required'
  })
});

const reverseGeocodeSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'Latitude must be a number',
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
    'any.required': 'Latitude is required'
  }),
  lng: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'Longitude must be a number',
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
    'any.required': 'Longitude is required'
  })
});

module.exports = {
  geocodeSchema,
  reverseGeocodeSchema
};
