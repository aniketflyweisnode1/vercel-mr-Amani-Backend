const Joi = require('joi');

const getOrderHistorySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Order_Now_id').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
  getOrderHistorySchema
};

