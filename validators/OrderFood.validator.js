const Joi = require('joi');

const getStoreByItemIdParamsSchema = Joi.object({
  Item_id: Joi.alternatives().try(
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required().messages({
    'any.required': 'Item ID is required',
    'number.positive': 'Item ID must be a positive number',
    'string.pattern.base': 'Item ID must be a valid number'
  })
});

module.exports = {
  getStoreByItemIdParamsSchema
};

