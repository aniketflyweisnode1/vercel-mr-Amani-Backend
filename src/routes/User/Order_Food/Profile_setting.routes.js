const express = require('express');
const router = express.Router();
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');
const {
  createProfileSetting,
  getAllProfileSettings,
  getProfileSettingById,
  updateProfileSetting,
  deleteProfileSetting,
  getProfileSettingByUserId,
  getProfileSettingByAuth
} = require('../../../controllers/Profile_setting.controller');
const {
  createProfileSettingSchema,
  updateProfileSettingSchema,
  getProfileSettingByIdSchema,
  getAllProfileSettingsSchema,
  getProfileSettingByUserIdSchema
} = require('../../../../validators/Profile_setting.validator');

router.post('/create', auth, validateBody(createProfileSettingSchema), createProfileSetting);
router.get('/getAll', validateQuery(getAllProfileSettingsSchema), getAllProfileSettings);
router.get('/getById/:id', auth, validateParams(getProfileSettingByIdSchema), getProfileSettingById);
router.put('/update/:id', auth, validateParams(getProfileSettingByIdSchema), validateBody(updateProfileSettingSchema), updateProfileSetting);
router.delete('/delete/:id', auth, validateParams(getProfileSettingByIdSchema), deleteProfileSetting);
router.get('/getByUserId/:User_id', auth, validateParams(getProfileSettingByUserIdSchema), getProfileSettingByUserId);
router.get('/getByAuth', auth, getProfileSettingByAuth);

module.exports = router;

