const Joi = require('joi');

const createDiscountsMapItemSchema = Joi.object({
  item_id: Joi.number().integer().positive().required(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateDiscountsMapItemSchema = Joi.object({
  item_id: Joi.number().integer().positive().optional(),
  Description: Joi.string().trim().max(1000).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getDiscountsMapItemByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllDiscountsMapItemsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  item_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_Item_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapItemsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.boolean().optional(),
  item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_Item_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapItemsByItemIdParamsSchema = Joi.object({
  item_id: Joi.number().integer().positive().required()
});

const getDiscountsMapItemsByItemIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_Item_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDiscountsMapItemsByBusinessBranchIdParamsSchema = Joi.object({
  business_Branch_id: Joi.number().integer().positive().required()
});

const getDiscountsMapItemsByBusinessBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  item_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Discounts_Map_Item_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createDiscountsMapItemSchema,
  updateDiscountsMapItemSchema,
  getDiscountsMapItemByIdSchema,
  getAllDiscountsMapItemsSchema,
  getDiscountsMapItemsByAuthSchema,
  getDiscountsMapItemsByItemIdParamsSchema,
  getDiscountsMapItemsByItemIdQuerySchema,
  getDiscountsMapItemsByBusinessBranchIdParamsSchema,
  getDiscountsMapItemsByBusinessBranchIdQuerySchema
};

