const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');
const {
  getOngoingOrders,
  getCompletedOrders
} = require('../../controllers/Order_History.controller');
const {
  getOrderHistorySchema
} = require('../../../validators/Order_History.validator');

router.get('/Ongoing', auth, validateQuery(getOrderHistorySchema), getOngoingOrders);
router.get('/Completed', auth, validateQuery(getOrderHistorySchema), getCompletedOrders);

module.exports = router;

