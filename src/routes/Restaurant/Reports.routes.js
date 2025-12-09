const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');
const {
  getReportListRestaurant
} = require('../../controllers/Reports.controller');
const {
  getReportListRestaurantSchema
} = require('../../../validators/Reports.validator');

router.get('/getReportListRestaurant', auth, validateQuery(getReportListRestaurantSchema), getReportListRestaurant);

module.exports = router;
