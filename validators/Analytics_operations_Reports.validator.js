const Joi = require('joi');

const getAnalyticsOperationsReportsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

module.exports = {
  getAnalyticsOperationsReportsSchema
};

