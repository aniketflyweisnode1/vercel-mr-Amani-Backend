const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductsTypes,
  getAllVendorProductsTypes,
  getVendorProductsTypesById,
  updateVendorProductsTypes,
  deleteVendorProductsTypes,
  getVendorProductsTypesByAuth
} = require('../../controllers/Vendor_Products_types.controller');
const {
  createVendorProductsTypesSchema,
  updateVendorProductsTypesSchema,
  getVendorProductsTypesByIdSchema,
  getAllVendorProductsTypesSchema,
  getVendorProductsTypesByAuthSchema
} = require('../../../validators/Vendor_Products_types.validator');

router.post('/create', auth, validateBody(createVendorProductsTypesSchema), createVendorProductsTypes);
router.get('/getAll', validateQuery(getAllVendorProductsTypesSchema), getAllVendorProductsTypes);
router.get('/getById/:id', auth, validateParams(getVendorProductsTypesByIdSchema), getVendorProductsTypesById);
router.put('/update/:id', auth, validateParams(getVendorProductsTypesByIdSchema), validateBody(updateVendorProductsTypesSchema), updateVendorProductsTypes);
router.delete('/delete/:id', auth, validateParams(getVendorProductsTypesByIdSchema), deleteVendorProductsTypes);
router.get('/getByAuth', auth, validateQuery(getVendorProductsTypesByAuthSchema), getVendorProductsTypesByAuth);

module.exports = router;
