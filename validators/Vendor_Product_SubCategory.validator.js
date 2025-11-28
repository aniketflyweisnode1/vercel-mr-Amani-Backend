const Joi = require('joi');

const createVendorProductSubCategorySchema = Joi.object({
  Vendor_Product_Category_id: Joi.number().integer().positive().required(),
  SubCategoryName: Joi.string().trim().max(200).required(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorProductSubCategorySchema = Joi.object({
  Vendor_Product_Category_id: Joi.number().integer().positive().optional(),
  SubCategoryName: Joi.string().trim().max(200).optional(),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorProductSubCategoryByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorProductSubCategoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Vendor_Product_Category_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Product_SubCategory_id', 'SubCategoryName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorProductSubCategoriesByCategoryIdParamsSchema = Joi.object({
  Vendor_Product_Category_id: Joi.number().integer().positive().required()
});

const getVendorProductSubCategoriesByCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Product_SubCategory_id', 'SubCategoryName').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorProductSubCategorySchema,
  updateVendorProductSubCategorySchema,
  getVendorProductSubCategoryByIdSchema,
  getAllVendorProductSubCategoriesSchema,
  getVendorProductSubCategoriesByCategoryIdParamsSchema,
  getVendorProductSubCategoriesByCategoryIdQuerySchema
};

