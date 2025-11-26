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
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_item_Category_id: Joi.number().integer().positive().optional(),
  requestStatus: Joi.string().valid('Pending', 'Process', 'Success').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Supplier_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createSupplierItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required(),
  Restaurant_item_Category_id: Joi.number().integer().positive().required(),
  ItemName: Joi.string().trim().min(2).max(150).required(),
  Quantity: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  MinThreshold: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).required(),
  requestStatus: Joi.string().valid('Pending', 'Process', 'Success').optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateSupplierItemSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().optional(),
  Restaurant_item_Category_id: Joi.number().integer().positive().optional(),
  ItemName: Joi.string().trim().min(2).max(150).optional(),
  Quantity: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  MinThreshold: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  requestStatus: Joi.string().valid('Pending', 'Process', 'Success').optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getSupplierItemByIdSchema = Joi.object({
  id: idSchema
});

const getAllSupplierItemsSchema = Joi.object(paginationBase);

const getSupplierItemsByAuthSchema = Joi.object(paginationBase);

const getSupplierItemsByCategoryParamsSchema = Joi.object({
  Restaurant_item_Category_id: Joi.number().integer().positive().required()
});

const getSupplierItemsByCategoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  requestStatus: Joi.string().valid('Pending', 'Process', 'Success').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Supplier_Items_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createSupplierItemSchema,
  updateSupplierItemSchema,
  getSupplierItemByIdSchema,
  getAllSupplierItemsSchema,
  getSupplierItemsByAuthSchema,
  getSupplierItemsByCategoryParamsSchema,
  getSupplierItemsByCategoryQuerySchema
};


