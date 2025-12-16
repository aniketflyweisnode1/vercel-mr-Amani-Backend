const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createDashboard,
  getAllDashboards,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
  getDashboardsByAuth,
  getDashboardByStoreId
} = require('../../controllers/Vendor_Items_Reviews_Dashboard.controller');
const {
  createDashboardSchema,
  updateDashboardSchema,
  getDashboardByIdSchema,
  getAllDashboardsSchema,
  getDashboardsByAuthSchema,
  getDashboardByStoreParamsSchema
} = require('../../../validators/Vendor_Items_Reviews_Dashboard.validator');

router.post('/create', auth, validateBody(createDashboardSchema), createDashboard);
router.get('/getAll', validateQuery(getAllDashboardsSchema), getAllDashboards);
router.get('/getById/:id', auth, validateParams(getDashboardByIdSchema), getDashboardById);
router.put('/update/:id', auth, validateParams(getDashboardByIdSchema), validateBody(updateDashboardSchema), updateDashboard);
router.delete('/delete/:id', auth, validateParams(getDashboardByIdSchema), deleteDashboard);
router.get('/getByAuth', auth, validateQuery(getDashboardsByAuthSchema), getDashboardsByAuth);
router.get('/getByStoreId/:Vendor_Store_id', auth, validateParams(getDashboardByStoreParamsSchema), getDashboardByStoreId);

module.exports = router;

