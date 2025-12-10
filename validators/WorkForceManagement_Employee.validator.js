const Joi = require('joi');

const accessPermissionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  Access: Joi.boolean().default(false)
});

const createWorkForceEmployeeSchema = Joi.object({
  Role_id: Joi.number().integer().positive().required(),
  type: Joi.string().valid('Branch', 'Department').required(),
  First_name: Joi.string().trim().min(2).max(100).required(),
  last_name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().max(200).required(),
  phoneNumber: Joi.string().trim().min(5).max(20).required(),
  Department_id: Joi.number().integer().positive().required(),
  Branch_id: Joi.number().integer().positive().optional().allow(null),
  employee_pic: Joi.string().trim().max(500).optional().allow(''),
  AcessPermission: Joi.array().items(accessPermissionSchema).optional(),
  Permission: Joi.string().trim().max(500).optional().allow(''),
  branchPermission: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

const updateWorkForceEmployeeSchema = Joi.object({
  Role_id: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('Branch', 'Department').optional(),
  First_name: Joi.string().trim().min(2).max(100).optional(),
  last_name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().trim().email().max(200).optional(),
  phoneNumber: Joi.string().trim().min(5).max(20).optional(),
  Department_id: Joi.number().integer().positive().optional(),
  Branch_id: Joi.number().integer().positive().optional().allow(null),
  employee_pic: Joi.string().trim().max(500).optional().allow(''),
  AcessPermission: Joi.array().items(accessPermissionSchema).optional(),
  Permission: Joi.string().trim().max(500).optional().allow(''),
  branchPermission: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getWorkForceEmployeeByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const baseListSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  role_id: Joi.number().integer().positive().optional(),
  department_id: Joi.number().integer().positive().optional(),
  Branch_id: Joi.number().integer().positive().optional(),
  type: Joi.string().valid('Branch', 'Department').optional(),
  sortBy: Joi.string().valid('First_name', 'created_at', 'updated_at', 'WorkForceManagement_Employee_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllWorkForceEmployeesSchema = Joi.object(baseListSchema);
const getWorkForceEmployeesByAuthSchema = Joi.object(baseListSchema);

module.exports = {
  createWorkForceEmployeeSchema,
  updateWorkForceEmployeeSchema,
  getWorkForceEmployeeByIdSchema,
  getAllWorkForceEmployeesSchema,
  getWorkForceEmployeesByAuthSchema
};



