const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  updateEmailCampaign,
  deleteEmailCampaign,
  getEmailCampaignsByAuth
} = require('../../controllers/Marketing_Promotions_EmailCampaign.controller');
const {
  createEmailCampaignSchema,
  updateEmailCampaignSchema,
  getEmailCampaignByIdSchema,
  getAllEmailCampaignsSchema,
  getEmailCampaignsByAuthSchema
} = require('../../../validators/Marketing_Promotions_EmailCampaign.validator');

router.post('/create', auth, validateBody(createEmailCampaignSchema), createEmailCampaign);
router.get('/getAll', validateQuery(getAllEmailCampaignsSchema), getAllEmailCampaigns);
router.get('/getById/:id', auth, validateParams(getEmailCampaignByIdSchema), getEmailCampaignById);
router.put('/update/:id', auth, validateParams(getEmailCampaignByIdSchema), validateBody(updateEmailCampaignSchema), updateEmailCampaign);
router.delete('/delete/:id', auth, validateParams(getEmailCampaignByIdSchema), deleteEmailCampaign);
router.get('/getByAuth', auth, validateQuery(getEmailCampaignsByAuthSchema), getEmailCampaignsByAuth);

module.exports = router;

