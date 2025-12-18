const Joi = require('joi');

const idSchema = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
).required();

const paginationBase = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  Vendor_Products_id: Joi.number().integer().positive().optional(),
  ReviewsStatus: Joi.string().valid('Excellent', 'Good', 'Average', 'Poor').optional(),
  User_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_Reviews_id', 'Reating').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createReviewSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required(),
  Vendor_Products_id: Joi.number().integer().positive().required(),
  Reating: Joi.number().min(0).max(5).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  User_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateReviewSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().optional(),
  Vendor_Products_id: Joi.number().integer().positive().optional(),
  Reating: Joi.number().min(0).max(5).optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  User_id: Joi.number().integer().positive().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getReviewByIdSchema = Joi.object({
  id: idSchema
});

const getAllReviewsSchema = Joi.object(paginationBase);

const getReviewsByAuthSchema = Joi.object(paginationBase);

const getReviewsByStoreParamsSchema = Joi.object({
  Vendor_Store_id: Joi.number().integer().positive().required()
});

const getReviewsByStatusParamsSchema = Joi.object({
  ReviewsStatus: Joi.string().valid('Excellent', 'Good', 'Average', 'Poor').required()
});

const getReviewsByStoreQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_Reviews_id', 'Reating').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  getReviewByIdSchema,
  getAllReviewsSchema,
  getReviewsByAuthSchema,
  getReviewsByStoreParamsSchema,
  getReviewsByStatusParamsSchema,
  getReviewsByStoreQuerySchema
};


