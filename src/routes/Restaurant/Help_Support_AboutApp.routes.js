const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createHelpSupportAboutApp,
  getAllHelpSupportAboutApps,
  getHelpSupportAboutAppById,
  updateHelpSupportAboutApp,
  deleteHelpSupportAboutApp,
  getHelpSupportAboutAppsByBranchId,
  getHelpSupportAboutAppsByAuth
} = require('../../controllers/Help_Support_AboutApp.controller');
const {
  createHelpSupportAboutAppSchema,
  updateHelpSupportAboutAppSchema,
  getHelpSupportAboutAppByIdSchema,
  getAllHelpSupportAboutAppsSchema,
  getHelpSupportAboutAppsByBranchIdParamsSchema,
  getHelpSupportAboutAppsByBranchIdQuerySchema,
  getHelpSupportAboutAppsByAuthSchema
} = require('../../../validators/Help_Support_AboutApp.validator');

router.post('/create', auth, validateBody(createHelpSupportAboutAppSchema), createHelpSupportAboutApp);
router.get('/getAll', validateQuery(getAllHelpSupportAboutAppsSchema), getAllHelpSupportAboutApps);
router.get('/getById/:id', auth, validateParams(getHelpSupportAboutAppByIdSchema), getHelpSupportAboutAppById);
router.put('/update/:id', auth, validateParams(getHelpSupportAboutAppByIdSchema), validateBody(updateHelpSupportAboutAppSchema), updateHelpSupportAboutApp);
router.delete('/delete/:id', auth, validateParams(getHelpSupportAboutAppByIdSchema), deleteHelpSupportAboutApp);
router.get('/getByBranchId/:Branch_Id', validateParams(getHelpSupportAboutAppsByBranchIdParamsSchema), validateQuery(getHelpSupportAboutAppsByBranchIdQuerySchema), getHelpSupportAboutAppsByBranchId);
router.get('/getByAuth', auth, validateQuery(getHelpSupportAboutAppsByAuthSchema), getHelpSupportAboutAppsByAuth);

module.exports = router;

