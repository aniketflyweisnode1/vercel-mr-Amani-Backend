const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');
const { getBusinessDashboard } = require('../../controllers/BusinessDashboard.controller');
const { getBusinessDashboardSchema } = require('../../../validators/BusinessDashboard.validator');

/**
 * @route   GET /api/v2/businessDashboard/getDashboard
 * @desc    Get business dashboard data for a branch
 * @access  Private
 * @query   {number} business_Branch_id - Business branch ID (required)
 * @query   {string} saleChartFilter - Filter for sales chart (Today, Yesterday, LastSevenDay, LastMonthDays)
 * @query   {string} productMixFilter - Filter for product mix chart (LastSevenDay, LastMonthDays)
 * @query   {string} operationsFilter - Filter for operations chart (LastSevenDay, LastMonthDays)
 * @query   {date} salesReportDate - Date for sales report
 * @query   {string} salesReportFilter - Filter for sales report (day, week, monthly, threemonth, year)
 * @query   {string} monthlyPerformanceFilter - Filter for monthly performance (today, week, month, alltime)
 */
router.get('/getDashboard', auth, validateQuery(getBusinessDashboardSchema), getBusinessDashboard);

module.exports = router;

