const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  getProvidersByAuth
} = require('../../controllers/Providers.controller');
const {
  createProviderSchema,
  updateProviderSchema,
  getProviderByIdSchema,
  getAllProvidersSchema,
  getProvidersByAuthSchema
} = require('../../../validators/Providers.validator');

router.post('/create', auth, validateBody(createProviderSchema), createProvider);
router.get('/getAll', validateQuery(getAllProvidersSchema), getAllProviders);
router.get('/getById/:id', auth, validateParams(getProviderByIdSchema), getProviderById);
router.put('/update/:id', auth, validateParams(getProviderByIdSchema), validateBody(updateProviderSchema), updateProvider);
router.delete('/delete/:id', auth, validateParams(getProviderByIdSchema), deleteProvider);
router.get('/getByAuth', auth, validateQuery(getProvidersByAuthSchema), getProvidersByAuth);

module.exports = router;
