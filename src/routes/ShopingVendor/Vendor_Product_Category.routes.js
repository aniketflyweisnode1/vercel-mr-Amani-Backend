const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductCategory,
  getAllVendorProductCategories,
  getVendorProductCategoryById,
  updateVendorProductCategory,
  deleteVendorProductCategory
} = require('../../controllers/Vendor_Product_Category.controller');
const {
  createVendorProductCategorySchema,
  updateVendorProductCategorySchema,
  getVendorProductCategoryByIdSchema,
  getAllVendorProductCategoriesSchema
} = require('../../../validators/Vendor_Product_Category.validator');

router.post('/create', auth, validateBody(createVendorProductCategorySchema), createVendorProductCategory);
router.get('/getAll', validateQuery(getAllVendorProductCategoriesSchema), getAllVendorProductCategories);
router.get('/getById/:id', auth, validateParams(getVendorProductCategoryByIdSchema), getVendorProductCategoryById);
router.put('/update/:id', auth, validateParams(getVendorProductCategoryByIdSchema), validateBody(updateVendorProductCategorySchema), updateVendorProductCategory);
router.delete('/delete/:id', auth, validateParams(getVendorProductCategoryByIdSchema), deleteVendorProductCategory);

module.exports = router;

