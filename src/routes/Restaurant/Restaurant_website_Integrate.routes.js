const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createIntegration,
  getAllIntegrations,
  getIntegrationById,
  updateIntegration,
  deleteIntegration,
  getIntegrationsByAuth,
  getIntegrationsByBranchId
} = require('../../controllers/Restaurant_website_Integrate.controller');
const {
  createIntegrationSchema,
  updateIntegrationSchema,
  getIntegrationByIdSchema,
  getAllIntegrationsSchema,
  getIntegrationsByAuthSchema,
  getIntegrationsByBranchParamsSchema
} = require('../../../validators/Restaurant_website_Integrate.validator');

router.post('/create', auth, validateBody(createIntegrationSchema), createIntegration);
router.get('/getAll', validateQuery(getAllIntegrationsSchema), getAllIntegrations);
router.get('/getById/:id', auth, validateParams(getIntegrationByIdSchema), getIntegrationById);
router.put('/update/:id', auth, validateParams(getIntegrationByIdSchema), validateBody(updateIntegrationSchema), updateIntegration);
router.delete('/delete/:id', auth, validateParams(getIntegrationByIdSchema), deleteIntegration);
router.get('/getByAuth', auth, validateQuery(getIntegrationsByAuthSchema), getIntegrationsByAuth);
router.get('/getByBranchId/:business_Branch_id', auth, validateParams(getIntegrationsByBranchParamsSchema), getIntegrationsByBranchId);

module.exports = router;

