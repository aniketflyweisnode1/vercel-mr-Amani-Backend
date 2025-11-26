const Joi = require('joi');

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  Status: Joi.boolean().optional().default(true)
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getDepartmentByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllDepartmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Departments_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDepartmentsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'Departments_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getDepartmentsByTypeIdParamsSchema = Joi.object({
  department_id: Joi.number().integer().positive().required()
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentByIdSchema,
  getAllDepartmentsSchema,
  getDepartmentsByAuthSchema,
  getDepartmentsByTypeIdParamsSchema
};



