const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductsFeatures,
  getAllVendorProductsFeatures,
  getVendorProductsFeaturesById,
  updateVendorProductsFeatures,
  deleteVendorProductsFeatures,
  getVendorProductsFeaturesByAuth
} = require('../../controllers/Vendor_Products_features.controller');
const {
  createVendorProductsFeaturesSchema,
  updateVendorProductsFeaturesSchema,
  getVendorProductsFeaturesByIdSchema,
  getAllVendorProductsFeaturesSchema,
  getVendorProductsFeaturesByAuthSchema
} = require('../../../validators/Vendor_Products_features.validator');

router.post('/create', auth, validateBody(createVendorProductsFeaturesSchema), createVendorProductsFeatures);
router.get('/getAll', validateQuery(getAllVendorProductsFeaturesSchema), getAllVendorProductsFeatures);
router.get('/getById/:id', auth, validateParams(getVendorProductsFeaturesByIdSchema), getVendorProductsFeaturesById);
router.put('/update/:id', auth, validateParams(getVendorProductsFeaturesByIdSchema), validateBody(updateVendorProductsFeaturesSchema), updateVendorProductsFeatures);
router.delete('/delete/:id', auth, validateParams(getVendorProductsFeaturesByIdSchema), deleteVendorProductsFeatures);
router.get('/getByAuth', auth, validateQuery(getVendorProductsFeaturesByAuthSchema), getVendorProductsFeaturesByAuth);

module.exports = router;
