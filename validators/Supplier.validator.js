const Joi = require('joi');

const createSupplierSchema = Joi.object({
  Name: Joi.string().trim().max(200).required()
    .messages({
      'string.empty': 'Supplier name is required',
      'string.max': 'Supplier name cannot exceed 200 characters',
      'any.required': 'Supplier name is required'
    }),
  Email: Joi.string().trim().email().max(200).allow('', null).optional(),
  Mobile: Joi.string().trim().max(20).allow('', null).optional(),
  Address: Joi.string().trim().max(500).allow('', null).optional(),
  Status: Joi.boolean().default(true)
});

const updateSupplierSchema = Joi.object({
  Name: Joi.string().trim().max(200).optional(),
  Email: Joi.string().trim().email().max(200).allow('', null).optional(),
  Mobile: Joi.string().trim().max(20).allow('', null).optional(),
  Address: Joi.string().trim().max(500).allow('', null).optional(),
  Status: Joi.boolean().optional()
});

const getSupplierByIdSchema = Joi.object({
  id: Joi.string().required()
    .messages({
      'string.empty': 'Supplier ID is required',
      'any.required': 'Supplier ID is required'
    })
});

const getAllSuppliersSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

const getSuppliersByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().allow('').optional(),
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

module.exports = {
  createSupplierSchema,
  updateSupplierSchema,
  getSupplierByIdSchema,
  getAllSuppliersSchema,
  getSuppliersByAuthSchema
};
