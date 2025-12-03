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
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Schedule_Meeting_id', 'meetingDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const createScheduleMeetingSchema = Joi.object({
  meetingDate: Joi.date().iso().required(),
  MeetingTime: Joi.string().trim().max(50).required(),
  ContactPersonName: Joi.string().trim().max(200).required(),
  PhoneNo: Joi.string().trim().max(20).required(),
  MeetingDuration: Joi.number().integer().min(1).optional(),
  Status: Joi.boolean().optional().default(true)
});

const updateScheduleMeetingSchema = Joi.object({
  meetingDate: Joi.date().iso().optional(),
  MeetingTime: Joi.string().trim().max(50).optional(),
  ContactPersonName: Joi.string().trim().max(200).optional(),
  PhoneNo: Joi.string().trim().max(20).optional(),
  MeetingDuration: Joi.number().integer().min(1).optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getScheduleMeetingByIdSchema = Joi.object({
  id: idSchema
});

const getAllScheduleMeetingsSchema = Joi.object(paginationBase);

const getScheduleMeetingsSubscriberGroupByPlanNameSchema = Joi.object({
  status: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string().valid('true', 'false', '1', '0')
  ).optional()
});

module.exports = {
  createScheduleMeetingSchema,
  updateScheduleMeetingSchema,
  getScheduleMeetingByIdSchema,
  getAllScheduleMeetingsSchema,
  getScheduleMeetingsSubscriberGroupByPlanNameSchema
};

