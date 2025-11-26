const Joi = require('joi');

const createHelpSupportFaqSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required(),
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').required(),
  Question: Joi.string().trim().max(500).required(),
  answer: Joi.string().trim().max(2000).optional().allow(''),
  attechFile: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateHelpSupportFaqSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').optional(),
  Question: Joi.string().trim().max(500).optional(),
  answer: Joi.string().trim().max(2000).optional().allow(''),
  attechFile: Joi.string().trim().max(500).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getHelpSupportFaqByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllHelpSupportFaqsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Faq_id', 'type').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportFaqsByTypeParamsSchema = Joi.object({
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').required()
});

const getHelpSupportFaqsByTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Faq_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportFaqsByBranchIdParamsSchema = Joi.object({
  Branch_Id: Joi.number().integer().positive().required()
});

const getHelpSupportFaqsByBranchIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Faq_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getHelpSupportFaqsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Branch_Id: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Help_Support_Faq_id', 'type').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createHelpSupportFaqSchema,
  updateHelpSupportFaqSchema,
  getHelpSupportFaqByIdSchema,
  getAllHelpSupportFaqsSchema,
  getHelpSupportFaqsByTypeParamsSchema,
  getHelpSupportFaqsByTypeQuerySchema,
  getHelpSupportFaqsByBranchIdParamsSchema,
  getHelpSupportFaqsByBranchIdQuerySchema,
  getHelpSupportFaqsByAuthSchema
};

