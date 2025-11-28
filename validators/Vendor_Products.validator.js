const Joi = require('joi');

const createVendorProductsSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  Products_image: Joi.string().trim().max(500).optional().allow(''),
  Title: Joi.string().trim().max(200).required(),
  Category_id: Joi.number().integer().positive().required(),
  Subcategory_id: Joi.number().integer().positive().optional().allow(null),
  Coupontype: Joi.string().valid('Public', 'Private').default('Public').optional(),
  brand: Joi.string().trim().max(100).optional().allow(''),
  Color: Joi.string().trim().max(50).optional().allow(''),
  Waranty: Joi.string().trim().max(200).optional().allow(''),
  inStock: Joi.number().integer().min(0).optional().default(0),
  Size: Joi.string().trim().max(100).optional().allow(''),
  Material: Joi.string().trim().max(200).optional().allow(''),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorProductsSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  Products_image: Joi.string().trim().max(500).optional().allow(''),
  Title: Joi.string().trim().max(200).optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Subcategory_id: Joi.number().integer().positive().optional().allow(null),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  brand: Joi.string().trim().max(100).optional().allow(''),
  Color: Joi.string().trim().max(50).optional().allow(''),
  Waranty: Joi.string().trim().max(200).optional().allow(''),
  inStock: Joi.number().integer().min(0).optional(),
  Size: Joi.string().trim().max(100).optional().allow(''),
  Material: Joi.string().trim().max(200).optional().allow(''),
  Description: Joi.string().trim().max(5000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorProductsByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Subcategory_id: Joi.number().integer().positive().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  Avaliable: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_id', 'Title', 'inStock').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorProductsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Subcategory_id: Joi.number().integer().positive().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  Avaliable: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_id', 'Title', 'inStock').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorProductsByCategoryIdParamsSchema = Joi.object({
  Category_id: Joi.number().integer().positive().required()
});

const getVendorProductsByCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Subcategory_id: Joi.number().integer().positive().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  Avaliable: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_id', 'Title', 'inStock').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorProductsBySubCategoryIdParamsSchema = Joi.object({
  Subcategory_id: Joi.number().integer().positive().required()
});

const getVendorProductsBySubCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  Avaliable: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Products_id', 'Title', 'inStock').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createVendorProductsSchema,
  updateVendorProductsSchema,
  getVendorProductsByIdSchema,
  getAllVendorProductsSchema,
  getVendorProductsByAuthSchema,
  getVendorProductsByCategoryIdParamsSchema,
  getVendorProductsByCategoryIdQuerySchema,
  getVendorProductsBySubCategoryIdParamsSchema,
  getVendorProductsBySubCategoryIdQuerySchema
};

