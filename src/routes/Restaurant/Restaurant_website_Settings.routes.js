const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createSettings,
  getAllSettings,
  getSettingsById,
  updateSettings,
  deleteSettings,
  getSettingsByAuth
} = require('../../controllers/Restaurant_website_Settings.controller');
const {
  createSettingsSchema,
  updateSettingsSchema,
  getSettingsByIdSchema,
  getAllSettingsSchema,
  getSettingsByAuthSchema
} = require('../../../validators/Restaurant_website_Settings.validator');

router.post('/create', auth, validateBody(createSettingsSchema), createSettings);
router.get('/getAll', validateQuery(getAllSettingsSchema), getAllSettings);
router.get('/getById/:id', auth, validateParams(getSettingsByIdSchema), getSettingsById);
router.put('/update/:id', auth, validateParams(getSettingsByIdSchema), validateBody(updateSettingsSchema), updateSettings);
router.delete('/delete/:id', auth, validateParams(getSettingsByIdSchema), deleteSettings);
router.get('/getByAuth', auth, validateQuery(getSettingsByAuthSchema), getSettingsByAuth);

module.exports = router;


