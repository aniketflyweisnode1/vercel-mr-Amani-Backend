const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createMarketingCouponCategory,
  getAllMarketingCouponCategories,
  getMarketingCouponCategoryById,
  updateMarketingCouponCategory,
  deleteMarketingCouponCategory,
  getMarketingCouponCategoriesByAuth
} = require('../../controllers/Marketing_Promotions_coupon_Category.controller');
const {
  createMarketingCouponCategorySchema,
  updateMarketingCouponCategorySchema,
  getMarketingCouponCategoryByIdSchema,
  getAllMarketingCouponCategoriesSchema,
  getMarketingCouponCategoriesByAuthSchema
} = require('../../../validators/Marketing_Promotions_coupon_Category.validator');

router.post('/create', auth, validateBody(createMarketingCouponCategorySchema), createMarketingCouponCategory);
router.get('/getAll', validateQuery(getAllMarketingCouponCategoriesSchema), getAllMarketingCouponCategories);
router.get('/getById/:id', auth, validateParams(getMarketingCouponCategoryByIdSchema), getMarketingCouponCategoryById);
router.put('/update/:id', auth, validateParams(getMarketingCouponCategoryByIdSchema), validateBody(updateMarketingCouponCategorySchema), updateMarketingCouponCategory);
router.delete('/delete/:id', auth, validateParams(getMarketingCouponCategoryByIdSchema), deleteMarketingCouponCategory);
router.get('/getByAuth', auth, validateQuery(getMarketingCouponCategoriesByAuthSchema), getMarketingCouponCategoriesByAuth);

module.exports = router;

