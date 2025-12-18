const Joi = require('joi');

// Vendor Report & Analytics - query validation
const getVendorReportandanalyticsSchema = Joi.object({
  // Use the same naming pattern as vendor dashboard for consistency
  Vender_store_id: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.string().pattern(/^\d+$/)
    )
    .required()
    .messages({
      'any.required': 'Vendor store ID is required',
      'number.base': 'Vendor store ID must be a number',
      'string.pattern.base': 'Vendor store ID must be a valid number'
    })
});

module.exports = {
  getVendorReportandanalyticsSchema
};


