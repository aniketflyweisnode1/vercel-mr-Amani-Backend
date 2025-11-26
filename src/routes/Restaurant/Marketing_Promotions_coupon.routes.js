const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createMarketingCoupon,
  getAllMarketingCoupons,
  getMarketingCouponById,
  updateMarketingCoupon,
  deleteMarketingCoupon,
  getMarketingCouponsByAuth,
  getMarketingCouponsByDiscountType,
  getMarketingCouponsByCouponType,
  getMarketingCouponsByCategoryId
} = require('../../controllers/Marketing_Promotions_coupon.controller');
const {
  createMarketingCouponSchema,
  updateMarketingCouponSchema,
  getMarketingCouponByIdSchema,
  getAllMarketingCouponsSchema,
  getMarketingCouponsByAuthSchema,
  getMarketingCouponsByDiscountTypeParamsSchema,
  getMarketingCouponsByDiscountTypeQuerySchema,
  getMarketingCouponsByCouponTypeParamsSchema,
  getMarketingCouponsByCouponTypeQuerySchema,
  getMarketingCouponsByCategoryParamsSchema,
  getMarketingCouponsByCategoryQuerySchema
} = require('../../../validators/Marketing_Promotions_coupon.validator');

router.post('/create', auth, validateBody(createMarketingCouponSchema), createMarketingCoupon);
router.get('/getAll', validateQuery(getAllMarketingCouponsSchema), getAllMarketingCoupons);
router.get('/getById/:id', auth, validateParams(getMarketingCouponByIdSchema), getMarketingCouponById);
router.put('/update/:id', auth, validateParams(getMarketingCouponByIdSchema), validateBody(updateMarketingCouponSchema), updateMarketingCoupon);
router.delete('/delete/:id', auth, validateParams(getMarketingCouponByIdSchema), deleteMarketingCoupon);
router.get('/getByAuth', auth, validateQuery(getMarketingCouponsByAuthSchema), getMarketingCouponsByAuth);
router.get('/getByDiscountType/:type', auth, validateParams(getMarketingCouponsByDiscountTypeParamsSchema), validateQuery(getMarketingCouponsByDiscountTypeQuerySchema), getMarketingCouponsByDiscountType);
router.get('/getByCouponType/:type', auth, validateParams(getMarketingCouponsByCouponTypeParamsSchema), validateQuery(getMarketingCouponsByCouponTypeQuerySchema), getMarketingCouponsByCouponType);
router.get('/getByCategoryId/:Marketing_Promotions_coupon_Category_id', auth, validateParams(getMarketingCouponsByCategoryParamsSchema), validateQuery(getMarketingCouponsByCategoryQuerySchema), getMarketingCouponsByCategoryId);

module.exports = router;

