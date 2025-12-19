const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const {
  getTaxesTab,
  getInCamp,
  getSalesReports,
  getPayoutes,
  getCommission,
  getRevenue,
  getRefundsDisputes
} = require('../../controllers/Vendor_Payment_Tab.controller');

// All endpoints require authentication and Vendor store ID
router.get('/Taxes_tab', auth, getTaxesTab);
router.get('/inCamp', auth, getInCamp);
router.get('/SalesReports', auth, getSalesReports);
router.get('/payoutes', auth, getPayoutes);
router.get('/Commission', auth, getCommission);
router.get('/Revenue', auth, getRevenue);
router.get('/RefundsDisputes', auth, getRefundsDisputes);

module.exports = router;

