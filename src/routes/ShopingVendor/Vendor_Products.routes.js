const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProducts,
  getAllVendorProducts,
  getVendorProductsById,
  updateVendorProducts,
  deleteVendorProducts,
  getVendorProductsByAuth,
  getVendorProductsByCategoryId,
  getVendorProductsBySubCategoryId
} = require('../../controllers/Vendor_Products.controller');
const {
  createVendorProductsSchema,
  updateVendorProductsSchema,
  getVendorProductsByIdSchema,
  getAllVendorProductsSchema,
  getVendorProductsByAuthSchema,
  getVendorProductsByCategoryIdParamsSchema,
  getVendorProductsByCategoryIdQuerySchema,
  getVendorProductsBySubCategoryIdParamsSchema,
  getVendorProductsBySubCategoryIdQuerySchema
} = require('../../../validators/Vendor_Products.validator');

router.post('/create', auth, validateBody(createVendorProductsSchema), createVendorProducts);
router.get('/getAll', validateQuery(getAllVendorProductsSchema), getAllVendorProducts);
router.get('/getById/:id', auth, validateParams(getVendorProductsByIdSchema), getVendorProductsById);
router.put('/update/:id', auth, validateParams(getVendorProductsByIdSchema), validateBody(updateVendorProductsSchema), updateVendorProducts);
router.delete('/delete/:id', auth, validateParams(getVendorProductsByIdSchema), deleteVendorProducts);
router.get('/getByAuth', auth, validateQuery(getVendorProductsByAuthSchema), getVendorProductsByAuth);
router.get('/getByCategoryId/:Category_id', validateParams(getVendorProductsByCategoryIdParamsSchema), validateQuery(getVendorProductsByCategoryIdQuerySchema), getVendorProductsByCategoryId);
router.get('/getBySubCategoryId/:Subcategory_id', validateParams(getVendorProductsBySubCategoryIdParamsSchema), validateQuery(getVendorProductsBySubCategoryIdQuerySchema), getVendorProductsBySubCategoryId);

module.exports = router;

