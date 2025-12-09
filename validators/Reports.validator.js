const Joi = require('joi');

const getReportListRestaurantSchema = Joi.object({
  business_Branch_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+$/).required()
  ).required().messages({
    'any.required': 'Business branch ID is required',
    'number.base': 'Business branch ID must be a number',
    'string.pattern.base': 'Business branch ID must be a valid number'
  })
});

module.exports = {
  getReportListRestaurantSchema
};
