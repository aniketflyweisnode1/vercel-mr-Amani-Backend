const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorStore,
  getAllVendorStores,
  getVendorStoreById,
  updateVendorStore,
  deleteVendorStore,
  getVendorStoresByAuth,
  getVendorDashboard
} = require('../../controllers/Vendor_Store.controller');
const {
  createVendorStoreSchema,
  updateVendorStoreSchema,
  getVendorStoreByIdSchema,
  getAllVendorStoresSchema,
  getVendorStoresByAuthSchema,
  getVendorDashboardSchema
} = require('../../../validators/Vendor_Store.validator');

router.post('/create', auth, validateBody(createVendorStoreSchema), createVendorStore);
router.get('/getAll', validateQuery(getAllVendorStoresSchema), getAllVendorStores);
router.get('/getById/:id', auth, validateParams(getVendorStoreByIdSchema), getVendorStoreById);
router.put('/update/:id', auth, validateParams(getVendorStoreByIdSchema), validateBody(updateVendorStoreSchema), updateVendorStore);
router.delete('/delete/:id', auth, validateParams(getVendorStoreByIdSchema), deleteVendorStore);
router.get('/getByAuth', auth, validateQuery(getVendorStoresByAuthSchema), getVendorStoresByAuth);
router.get('/VendorDashboard', auth, validateQuery(getVendorDashboardSchema), getVendorDashboard);

module.exports = router;

