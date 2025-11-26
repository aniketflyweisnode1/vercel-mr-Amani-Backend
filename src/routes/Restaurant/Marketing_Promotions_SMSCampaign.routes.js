const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createSmsCampaign,
  getAllSmsCampaigns,
  getSmsCampaignById,
  updateSmsCampaign,
  deleteSmsCampaign,
  getSmsCampaignsByAuth
} = require('../../controllers/Marketing_Promotions_SMSCampaign.controller');
const {
  createSmsCampaignSchema,
  updateSmsCampaignSchema,
  getSmsCampaignByIdSchema,
  getAllSmsCampaignsSchema,
  getSmsCampaignsByAuthSchema
} = require('../../../validators/Marketing_Promotions_SMSCampaign.validator');

router.post('/create', auth, validateBody(createSmsCampaignSchema), createSmsCampaign);
router.get('/getAll', validateQuery(getAllSmsCampaignsSchema), getAllSmsCampaigns);
router.get('/getById/:id', auth, validateParams(getSmsCampaignByIdSchema), getSmsCampaignById);
router.put('/update/:id', auth, validateParams(getSmsCampaignByIdSchema), validateBody(updateSmsCampaignSchema), updateSmsCampaign);
router.delete('/delete/:id', auth, validateParams(getSmsCampaignByIdSchema), deleteSmsCampaign);
router.get('/getByAuth', auth, validateQuery(getSmsCampaignsByAuthSchema), getSmsCampaignsByAuth);

module.exports = router;

