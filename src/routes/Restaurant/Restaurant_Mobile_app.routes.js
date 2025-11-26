const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createMobileApp,
  getAllMobileApps,
  getMobileAppById,
  updateMobileApp,
  deleteMobileApp,
  getMobileAppsByAuth,
  getMobileAppsByBranchId
} = require('../../controllers/Restaurant_Mobile_app.controller');
const {
  createMobileAppSchema,
  updateMobileAppSchema,
  getMobileAppByIdSchema,
  getAllMobileAppsSchema,
  getMobileAppsByAuthSchema,
  getMobileAppsByBranchParamsSchema,
  getMobileAppsByBranchQuerySchema
} = require('../../../validators/Restaurant_Mobile_app.validator');

router.post('/create', auth, validateBody(createMobileAppSchema), createMobileApp);
router.get('/getAll', validateQuery(getAllMobileAppsSchema), getAllMobileApps);
router.get('/getById/:id', auth, validateParams(getMobileAppByIdSchema), getMobileAppById);
router.put('/update/:id', auth, validateParams(getMobileAppByIdSchema), validateBody(updateMobileAppSchema), updateMobileApp);
router.delete('/delete/:id', auth, validateParams(getMobileAppByIdSchema), deleteMobileApp);
router.get('/getByAuth', auth, validateQuery(getMobileAppsByAuthSchema), getMobileAppsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getMobileAppsByBranchQuerySchema), validateParams(getMobileAppsByBranchParamsSchema), getMobileAppsByBranchId);

module.exports = router;

