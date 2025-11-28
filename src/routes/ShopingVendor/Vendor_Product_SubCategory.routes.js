const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorProductSubCategory,
  getAllVendorProductSubCategories,
  getVendorProductSubCategoryById,
  updateVendorProductSubCategory,
  deleteVendorProductSubCategory,
  getVendorProductSubCategoriesByCategoryId
} = require('../../controllers/Vendor_Product_SubCategory.controller');
const {
  createVendorProductSubCategorySchema,
  updateVendorProductSubCategorySchema,
  getVendorProductSubCategoryByIdSchema,
  getAllVendorProductSubCategoriesSchema,
  getVendorProductSubCategoriesByCategoryIdParamsSchema,
  getVendorProductSubCategoriesByCategoryIdQuerySchema
} = require('../../../validators/Vendor_Product_SubCategory.validator');

router.post('/create', auth, validateBody(createVendorProductSubCategorySchema), createVendorProductSubCategory);
router.get('/getAll', validateQuery(getAllVendorProductSubCategoriesSchema), getAllVendorProductSubCategories);
router.get('/getById/:id', auth, validateParams(getVendorProductSubCategoryByIdSchema), getVendorProductSubCategoryById);
router.put('/update/:id', auth, validateParams(getVendorProductSubCategoryByIdSchema), validateBody(updateVendorProductSubCategorySchema), updateVendorProductSubCategory);
router.delete('/delete/:id', auth, validateParams(getVendorProductSubCategoryByIdSchema), deleteVendorProductSubCategory);
router.get('/getByVendor_Product_Category_id/:Vendor_Product_Category_id', validateParams(getVendorProductSubCategoriesByCategoryIdParamsSchema), validateQuery(getVendorProductSubCategoriesByCategoryIdQuerySchema), getVendorProductSubCategoriesByCategoryId);

module.exports = router;

