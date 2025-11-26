const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createCampaignType,
  getAllCampaignTypes,
  getCampaignTypeById,
  updateCampaignType,
  deleteCampaignType,
  getCampaignTypesByAuth,
  getCampaignTypeByTypeId
} = require('../../controllers/CampaignType.controller');
const {
  createCampaignTypeSchema,
  updateCampaignTypeSchema,
  getCampaignTypeByIdSchema,
  getAllCampaignTypesSchema,
  getCampaignTypesByAuthSchema,
  getCampaignTypeByTypeIdParamsSchema
} = require('../../../validators/CampaignType.validator');

router.post('/create', auth, validateBody(createCampaignTypeSchema), createCampaignType);
router.get('/getAll', validateQuery(getAllCampaignTypesSchema), getAllCampaignTypes);
router.get('/getById/:id', auth, validateParams(getCampaignTypeByIdSchema), getCampaignTypeById);
router.put('/update/:id', auth, validateParams(getCampaignTypeByIdSchema), validateBody(updateCampaignTypeSchema), updateCampaignType);
router.delete('/delete/:id', auth, validateParams(getCampaignTypeByIdSchema), deleteCampaignType);
router.get('/getByAuth', auth, validateQuery(getCampaignTypesByAuthSchema), getCampaignTypesByAuth);
router.get('/getByTypeId/:CampaignType_id', auth, validateParams(getCampaignTypeByTypeIdParamsSchema), getCampaignTypeByTypeId);

module.exports = router;

