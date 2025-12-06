const Joi = require('joi');

const createSocketChatSchema = Joi.object({
  UserName: Joi.string().trim().max(200).optional().allow('', null),
  User_id: Joi.number().integer().positive().required(),
  TextMessage: Joi.string().trim().max(5000).optional().allow('', null),
  fileImage: Joi.string().trim().max(500).optional().allow('', null),
  emozi: Joi.string().trim().max(10).optional().allow('', null),
  Status: Joi.boolean().optional()
});

const updateSocketChatSchema = Joi.object({
  UserName: Joi.string().trim().max(200).optional().allow('', null),
  User_id: Joi.number().integer().positive().optional(),
  TextMessage: Joi.string().trim().max(5000).optional().allow('', null),
  fileImage: Joi.string().trim().max(500).optional().allow('', null),
  emozi: Joi.string().trim().max(10).optional().allow('', null),
  Status: Joi.boolean().optional()
});

const getSocketChatByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

const getAllSocketChatsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  Status: Joi.boolean().optional(),
  User_id: Joi.number().integer().positive().optional(),
  search: Joi.string().trim().optional().allow('', null)
});

const getSocketChatsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  Status: Joi.boolean().optional(),
  search: Joi.string().trim().optional().allow('', null)
});

const getSocketChatsByUserIdParamsSchema = Joi.object({
  User_id: Joi.number().integer().positive().required()
});

const getSocketChatsByUserIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  Status: Joi.boolean().optional(),
  search: Joi.string().trim().optional().allow('', null)
});

module.exports = {
  createSocketChatSchema,
  updateSocketChatSchema,
  getSocketChatByIdSchema,
  getAllSocketChatsSchema,
  getSocketChatsByAuthSchema,
  getSocketChatsByUserIdParamsSchema,
  getSocketChatsByUserIdQuerySchema
};

