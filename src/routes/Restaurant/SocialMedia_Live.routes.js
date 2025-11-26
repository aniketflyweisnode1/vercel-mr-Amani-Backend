const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createSocialMediaLive,
  getAllSocialMediaLives,
  getSocialMediaLiveById,
  updateSocialMediaLive,
  deleteSocialMediaLive,
  getSocialMediaLivesByAuth,
  getSocialMediaLivesByBranchId
} = require('../../controllers/SocialMedia_Live.controller');
const {
  createSocialMediaLiveSchema,
  updateSocialMediaLiveSchema,
  getSocialMediaLiveByIdSchema,
  getAllSocialMediaLivesSchema,
  getSocialMediaLivesByAuthSchema,
  getSocialMediaLivesByBranchParamsSchema
} = require('../../../validators/SocialMedia_Live.validator');

router.post('/create', auth, validateBody(createSocialMediaLiveSchema), createSocialMediaLive);
router.get('/getAll', validateQuery(getAllSocialMediaLivesSchema), getAllSocialMediaLives);
router.get('/getById/:id', auth, validateParams(getSocialMediaLiveByIdSchema), getSocialMediaLiveById);
router.put('/update/:id', auth, validateParams(getSocialMediaLiveByIdSchema), validateBody(updateSocialMediaLiveSchema), updateSocialMediaLive);
router.delete('/delete/:id', auth, validateParams(getSocialMediaLiveByIdSchema), deleteSocialMediaLive);
router.get('/getByAuth', auth, validateQuery(getSocialMediaLivesByAuthSchema), getSocialMediaLivesByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateQuery(getAllSocialMediaLivesSchema), validateParams(getSocialMediaLivesByBranchParamsSchema), getSocialMediaLivesByBranchId);

module.exports = router;

