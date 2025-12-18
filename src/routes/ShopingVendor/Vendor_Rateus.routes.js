const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorRateus,
  getAllVendorRateuses,
  getVendorRateusById,
  updateVendorRateus,
  deleteVendorRateus,
  getVendorRateusesByFeel,
  getVendorRateusesByStoreId,
  getVendorRateusesByAuth
} = require('../../controllers/Vendor_Rateus.controller');
const {
  createVendorRateusSchema,
  updateVendorRateusSchema,
  getVendorRateusByIdSchema,
  getAllVendorRateusesSchema,
  getVendorRateusesByFeelParamsSchema,
  getVendorRateusesByFeelQuerySchema,
  getVendorRateusesByStoreIdParamsSchema,
  getVendorRateusesByStoreIdQuerySchema,
  getVendorRateusesByAuthSchema
} = require('../../../validators/Vendor_Rateus.validator');

router.post('/create', auth, validateBody(createVendorRateusSchema), createVendorRateus);
router.get('/getAll', validateQuery(getAllVendorRateusesSchema), getAllVendorRateuses);
router.get('/getById/:id', auth, validateParams(getVendorRateusByIdSchema), getVendorRateusById);
router.put('/update/:id', auth, validateParams(getVendorRateusByIdSchema), validateBody(updateVendorRateusSchema), updateVendorRateus);
router.delete('/delete/:id', auth, validateParams(getVendorRateusByIdSchema), deleteVendorRateus);
router.get('/getByFeel/:feel', validateParams(getVendorRateusesByFeelParamsSchema), validateQuery(getVendorRateusesByFeelQuerySchema), getVendorRateusesByFeel);
router.get('/getByStoreId/:Vendor_Store_id', validateParams(getVendorRateusesByStoreIdParamsSchema), validateQuery(getVendorRateusesByStoreIdQuerySchema), getVendorRateusesByStoreId);
router.get('/getByAuth', auth, validateQuery(getVendorRateusesByAuthSchema), getVendorRateusesByAuth);

module.exports = router;


