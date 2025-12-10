const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createSettingsAppPartnersNeedsSchema, updateSettingsAppPartnersNeedsSchema, getSettingsAppPartnersNeedsByIdSchema, getAllSettingsAppPartnersNeedsSchema, getSettingsAppPartnersNeedsByBranchIdParamsSchema, getSettingsAppPartnersNeedsByBranchIdQuerySchema, getSettingsAppPartnersNeedsByAuthSchema } = require('../../../validators/Settings_App_Partners_Needs.validator');
const { createSettingsAppPartnersNeeds, getAllSettingsAppPartnersNeeds, getSettingsAppPartnersNeedsById, updateSettingsAppPartnersNeeds, deleteSettingsAppPartnersNeeds, getSettingsAppPartnersNeedsByBranchId, getSettingsAppPartnersNeedsByAuth } = require('../../controllers/Settings_App_Partners_Needs.controller');

router.post('/create', auth, validateBody(createSettingsAppPartnersNeedsSchema), createSettingsAppPartnersNeeds);
router.get('/getAll', validateQuery(getAllSettingsAppPartnersNeedsSchema), getAllSettingsAppPartnersNeeds);
router.get('/getById/:id', auth, validateParams(getSettingsAppPartnersNeedsByIdSchema), getSettingsAppPartnersNeedsById);
router.put('/update/:id', auth, validateParams(getSettingsAppPartnersNeedsByIdSchema), validateBody(updateSettingsAppPartnersNeedsSchema), updateSettingsAppPartnersNeeds);
router.delete('/delete/:id', auth, validateParams(getSettingsAppPartnersNeedsByIdSchema), deleteSettingsAppPartnersNeeds);
router.get('/getByBranchId/:Branch_id', auth, validateParams(getSettingsAppPartnersNeedsByBranchIdParamsSchema), validateQuery(getSettingsAppPartnersNeedsByBranchIdQuerySchema), getSettingsAppPartnersNeedsByBranchId);
router.get('/getByAuth', auth, validateQuery(getSettingsAppPartnersNeedsByAuthSchema), getSettingsAppPartnersNeedsByAuth);

module.exports = router;
