const Joi = require('joi');

const yourFeelSchema = Joi.object({
  status: Joi.string().trim().max(100).optional().allow(''),
  Emozi: Joi.string().trim().max(50).optional().allow('')
});

const createVendorRateusSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required(),
  YourFeel: yourFeelSchema.optional(),
  Feedback: Joi.string().trim().max(2000).optional().allow(''),
  Ratings: Joi.number().min(0).max(5).optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorRateusSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  YourFeel: yourFeelSchema.optional(),
  Feedback: Joi.string().trim().max(2000).optional().allow(''),
  Ratings: Joi.number().min(0).max(5).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorRateusByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorRateusesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorRateusesByFeelParamsSchema = Joi.object({
  feel: Joi.string().trim().max(100).required()
});

const getVendorRateusesByFeelQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorRateusesByStoreIdParamsSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required()
});

const getVendorRateusesByStoreIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorRateusesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Rateus_id', 'Ratings').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorRateusSchema,
  updateVendorRateusSchema,
  getVendorRateusByIdSchema,
  getAllVendorRateusesSchema,
  getVendorRateusesByFeelParamsSchema,
  getVendorRateusesByFeelQuerySchema,
  getVendorRateusesByStoreIdParamsSchema,
  getVendorRateusesByStoreIdQuerySchema,
  getVendorRateusesByAuthSchema
};


