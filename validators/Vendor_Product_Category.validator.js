const Joi = require('joi');

const createVendorProductCategorySchema = Joi.object({
  CategoryName: Joi.string().trim().max(200).required(),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorProductCategorySchema = Joi.object({
  CategoryName: Joi.string().trim().max(200).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorProductCategoryByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorProductCategoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Product_Category_id', 'CategoryName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorProductCategorySchema,
  updateVendorProductCategorySchema,
  getVendorProductCategoryByIdSchema,
  getAllVendorProductCategoriesSchema
};

