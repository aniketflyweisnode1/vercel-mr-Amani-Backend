const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateQuery } = require('../../../../middleware/validation');
const {
  getAnalyticsSocialMediaReports
} = require('../../../controllers/Analytics_social_media_Reports.controller');
const {
  getAnalyticsSocialMediaReportsSchema
} = require('../../../../validators/Analytics_social_media_Reports.validator');

router.get('/getAnalyticsSocialMediaReports', auth, validateQuery(getAnalyticsSocialMediaReportsSchema), getAnalyticsSocialMediaReports);

module.exports = router;

