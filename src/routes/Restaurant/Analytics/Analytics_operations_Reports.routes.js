const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateQuery } = require('../../../../middleware/validation');
const {
  getAnalyticsOperationsReports
} = require('../../../controllers/Analytics_operations_Reports.controller');
const {
  getAnalyticsOperationsReportsSchema
} = require('../../../../validators/Analytics_operations_Reports.validator');

router.get('/getAnalyticsOperationsReports', auth, validateQuery(getAnalyticsOperationsReportsSchema), getAnalyticsOperationsReports);

module.exports = router;

