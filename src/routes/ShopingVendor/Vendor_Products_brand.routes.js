const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductsBrand,
  getAllVendorProductsBrands,
  getVendorProductsBrandById,
  updateVendorProductsBrand,
  deleteVendorProductsBrand,
  getVendorProductsBrandsByAuth
} = require('../../controllers/Vendor_Products_brand.controller');
const {
  createVendorProductsBrandSchema,
  updateVendorProductsBrandSchema,
  getVendorProductsBrandByIdSchema,
  getAllVendorProductsBrandsSchema,
  getVendorProductsBrandsByAuthSchema
} = require('../../../validators/Vendor_Products_brand.validator');

router.post('/create', auth, validateBody(createVendorProductsBrandSchema), createVendorProductsBrand);
router.get('/getAll', validateQuery(getAllVendorProductsBrandsSchema), getAllVendorProductsBrands);
router.get('/getById/:id', auth, validateParams(getVendorProductsBrandByIdSchema), getVendorProductsBrandById);
router.put('/update/:id', auth, validateParams(getVendorProductsBrandByIdSchema), validateBody(updateVendorProductsBrandSchema), updateVendorProductsBrand);
router.delete('/delete/:id', auth, validateParams(getVendorProductsBrandByIdSchema), deleteVendorProductsBrand);
router.get('/getByAuth', auth, validateQuery(getVendorProductsBrandsByAuthSchema), getVendorProductsBrandsByAuth);

module.exports = router;
