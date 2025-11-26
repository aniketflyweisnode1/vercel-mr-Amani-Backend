const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createHelpSupportRateus,
  getAllHelpSupportRateuses,
  getHelpSupportRateusById,
  updateHelpSupportRateus,
  deleteHelpSupportRateus,
  getHelpSupportRateusesByFeel,
  getHelpSupportRateusesByBranchId,
  getHelpSupportRateusesByAuth
} = require('../../controllers/Help_Support_Rateus.controller');
const {
  createHelpSupportRateusSchema,
  updateHelpSupportRateusSchema,
  getHelpSupportRateusByIdSchema,
  getAllHelpSupportRateusesSchema,
  getHelpSupportRateusesByFeelParamsSchema,
  getHelpSupportRateusesByFeelQuerySchema,
  getHelpSupportRateusesByBranchIdParamsSchema,
  getHelpSupportRateusesByBranchIdQuerySchema,
  getHelpSupportRateusesByAuthSchema
} = require('../../../validators/Help_Support_Rateus.validator');

router.post('/create', auth, validateBody(createHelpSupportRateusSchema), createHelpSupportRateus);
router.get('/getAll', validateQuery(getAllHelpSupportRateusesSchema), getAllHelpSupportRateuses);
router.get('/getById/:id', auth, validateParams(getHelpSupportRateusByIdSchema), getHelpSupportRateusById);
router.put('/update/:id', auth, validateParams(getHelpSupportRateusByIdSchema), validateBody(updateHelpSupportRateusSchema), updateHelpSupportRateus);
router.delete('/delete/:id', auth, validateParams(getHelpSupportRateusByIdSchema), deleteHelpSupportRateus);
router.get('/getByFeel/:feel', validateParams(getHelpSupportRateusesByFeelParamsSchema), validateQuery(getHelpSupportRateusesByFeelQuerySchema), getHelpSupportRateusesByFeel);
router.get('/getByBranchId/:Branch_Id', validateParams(getHelpSupportRateusesByBranchIdParamsSchema), validateQuery(getHelpSupportRateusesByBranchIdQuerySchema), getHelpSupportRateusesByBranchId);
router.get('/getByAuth', auth, validateQuery(getHelpSupportRateusesByAuthSchema), getHelpSupportRateusesByAuth);

module.exports = router;

