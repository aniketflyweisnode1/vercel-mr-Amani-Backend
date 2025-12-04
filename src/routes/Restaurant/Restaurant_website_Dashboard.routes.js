const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createWebsiteDashboard,
  getAllWebsiteDashboards,
  getWebsiteDashboardById,
  updateWebsiteDashboard,
  deleteWebsiteDashboard
} = require('../../controllers/Restaurant_website_Dashboard.controller');
const {
  createWebsiteDashboardSchema,
  updateWebsiteDashboardSchema,
  getWebsiteDashboardByIdSchema,
  getAllWebsiteDashboardsSchema
} = require('../../../validators/Restaurant_website_Dashboard.validator');

router.post('/create', auth, validateBody(createWebsiteDashboardSchema), createWebsiteDashboard);
router.get('/getAll', validateQuery(getAllWebsiteDashboardsSchema), getAllWebsiteDashboards);
router.get('/getById/:id', auth, validateParams(getWebsiteDashboardByIdSchema), getWebsiteDashboardById);
router.put('/update/:id', auth, validateParams(getWebsiteDashboardByIdSchema), validateBody(updateWebsiteDashboardSchema), updateWebsiteDashboard);
router.delete('/delete/:id', auth, validateParams(getWebsiteDashboardByIdSchema), deleteWebsiteDashboard);

module.exports = router;

