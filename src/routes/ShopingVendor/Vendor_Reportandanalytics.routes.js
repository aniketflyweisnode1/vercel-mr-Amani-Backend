const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');
const {
  getVendorReportandanalytics
} = require('../../controllers/Vendor_Reportandanalytics.controller');
const {
  getVendorReportandanalyticsSchema
} = require('../../../validators/Vendor_Reportandanalytics.validator');

// Vendor Report & Analytics for a specific store
router.get('/getReportandanalytics', auth,  getVendorReportandanalytics);

module.exports = router;


