const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');
const {
  getOngoingOrders,
  getCompletedOrders,
  getOrders
} = require('../../controllers/Order_History.controller');
const {
  getOrderHistorySchema,
  getOrdersSchema
} = require('../../../validators/Order_History.validator');

/**
 * @route   GET /api/v2/Order_History/getOrders
 * @desc    Get orders with filters (serviceId, status, time)
 * @access  Private (requires authentication)
 * @query   { page?: number, limit?: number, serviceId?: number, status?: 'all'|'true'|'Scheduled'|'Completed', time?: 'Today'|'ThisWeek'|'ThisMonth'|'all', sortBy?: string, sortOrder?: 'asc'|'desc' }
 */
router.get('/getOrders', auth, validateQuery(getOrdersSchema), getOrders);

router.get('/Ongoing', auth, validateQuery(getOrderHistorySchema), getOngoingOrders);
router.get('/Completed', auth, validateQuery(getOrderHistorySchema), getCompletedOrders);

module.exports = router;

