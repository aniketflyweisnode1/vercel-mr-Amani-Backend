const Joi = require('joi');

const workingHourSchema = Joi.object({
  Day: Joi.string().trim().min(1).max(100).required(),
  Houre: Joi.array().items(Joi.object().unknown(true)).optional()
});

const createScheduleEveryOneSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  worckingHoure: Joi.array().items(workingHourSchema).optional(),
  otherInfo_type: Joi.string().trim().max(200).optional().allow(''),
  Business: Joi.string().trim().max(200).optional().allow(''),
  Status: Joi.boolean().optional()
});

const updateScheduleEveryOneSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  worckingHoure: Joi.array().items(workingHourSchema).optional(),
  otherInfo_type: Joi.string().trim().max(200).optional().allow(''),
  Business: Joi.string().trim().max(200).optional().allow(''),
  Status: Joi.boolean().optional()
}).min(1);

const getScheduleEveryOneByIdSchema = Joi.object({
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
  otherInfo_type: Joi.string().trim().max(200).optional(),
  Business: Joi.string().trim().max(200).optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'WorkForceManagement_Schedule_EveryOne_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllScheduleEveryOneSchema = Joi.object(baseListSchema);
const getScheduleEveryOneByAuthSchema = Joi.object(baseListSchema);

const getScheduleEveryOneByTypeParamsSchema = Joi.object({
  type: Joi.string().trim().max(200).required()
});

const getScheduleEveryOneByTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Business: Joi.string().trim().max(200).optional(),
  sortBy: Joi.string().valid('name', 'created_at', 'updated_at', 'WorkForceManagement_Schedule_EveryOne_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  createScheduleEveryOneSchema,
  updateScheduleEveryOneSchema,
  getScheduleEveryOneByIdSchema,
  getAllScheduleEveryOneSchema,
  getScheduleEveryOneByAuthSchema,
  getScheduleEveryOneByTypeParamsSchema,
  getScheduleEveryOneByTypeQuerySchema
};


