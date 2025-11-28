const Joi = require('joi');

const createUserAddressSchema = Joi.object({
  GoogleAddress: Joi.string().trim().max(1000).optional().allow(''),
  Address: Joi.string().trim().max(500).optional().allow(''),
  setDefult: Joi.boolean().optional().default(false),
  City: Joi.number().integer().positive().optional().allow(null),
  State: Joi.number().integer().positive().optional().allow(null),
  Country: Joi.number().integer().positive().optional().allow(null),
  zipcode: Joi.string().trim().max(20).optional().allow(''),
  Status: Joi.boolean().optional().default(true)
});

const updateUserAddressSchema = Joi.object({
  GoogleAddress: Joi.string().trim().max(1000).optional().allow(''),
  Address: Joi.string().trim().max(500).optional().allow(''),
  setDefult: Joi.boolean().optional(),
  City: Joi.number().integer().positive().optional().allow(null),
  State: Joi.number().integer().positive().optional().allow(null),
  Country: Joi.number().integer().positive().optional().allow(null),
  zipcode: Joi.string().trim().max(20).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getUserAddressByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllUserAddressesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  City: Joi.number().integer().positive().optional(),
  State: Joi.number().integer().positive().optional(),
  Country: Joi.number().integer().positive().optional(),
  setDefult: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'User_Address_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getUserAddressesByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  City: Joi.number().integer().positive().optional(),
  State: Joi.number().integer().positive().optional(),
  Country: Joi.number().integer().positive().optional(),
  setDefult: Joi.boolean().optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'User_Address_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createUserAddressSchema,
  updateUserAddressSchema,
  getUserAddressByIdSchema,
  getAllUserAddressesSchema,
  getUserAddressesByAuthSchema
};

