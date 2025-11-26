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
  getDashboardByBranchId
} = require('../../controllers/Restaurant_Items_Reviews_Dashboard.controller');
const {
  createDashboardSchema,
  updateDashboardSchema,
  getDashboardByIdSchema,
  getAllDashboardsSchema,
  getDashboardsByAuthSchema,
  getDashboardByBranchParamsSchema
} = require('../../../validators/Restaurant_Items_Reviews_Dashboard.validator');

router.post('/create', auth, validateBody(createDashboardSchema), createDashboard);
router.get('/getAll', validateQuery(getAllDashboardsSchema), getAllDashboards);
router.get('/getById/:id', auth, validateParams(getDashboardByIdSchema), getDashboardById);
router.put('/update/:id', auth, validateParams(getDashboardByIdSchema), validateBody(updateDashboardSchema), updateDashboard);
router.delete('/delete/:id', auth, validateParams(getDashboardByIdSchema), deleteDashboard);
router.get('/getByAuth', auth, validateQuery(getDashboardsByAuthSchema), getDashboardsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateParams(getDashboardByBranchParamsSchema), getDashboardByBranchId);

module.exports = router;


