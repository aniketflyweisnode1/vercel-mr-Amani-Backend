const Joi = require('joi');

const getAnalyticsSocialMediaReportsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  getAnalyticsSocialMediaReportsSchema
};

