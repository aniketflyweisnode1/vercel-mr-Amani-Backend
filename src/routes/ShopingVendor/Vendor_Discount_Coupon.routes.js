const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const {
  createVendorDiscountCoupon,
  getAllVendorDiscountCoupons,
  getVendorDiscountCouponById,
  updateVendorDiscountCoupon,
  deleteVendorDiscountCoupon,
  getVendorDiscountCouponsByAuth,
  getVendorDiscountCouponsByCategoryId,
  getVendorDiscountCouponsByDiscountType,
  getVendorDiscountCouponsByCouponType
} = require('../../controllers/Vendor_Discount_Coupon.controller');
const {
  createVendorDiscountCouponSchema,
  updateVendorDiscountCouponSchema,
  getVendorDiscountCouponByIdSchema,
  getAllVendorDiscountCouponsSchema,
  getVendorDiscountCouponsByAuthSchema,
  getVendorDiscountCouponsByCategoryIdParamsSchema,
  getVendorDiscountCouponsByCategoryIdQuerySchema,
  getVendorDiscountCouponsByDiscountTypeParamsSchema,
  getVendorDiscountCouponsByDiscountTypeQuerySchema,
  getVendorDiscountCouponsByCouponTypeParamsSchema,
  getVendorDiscountCouponsByCouponTypeQuerySchema
} = require('../../../validators/Vendor_Discount_Coupon.validator');

router.post('/create', auth, validateBody(createVendorDiscountCouponSchema), createVendorDiscountCoupon);
router.get('/getAll', validateQuery(getAllVendorDiscountCouponsSchema), getAllVendorDiscountCoupons);
router.get('/getById/:id', auth, validateParams(getVendorDiscountCouponByIdSchema), getVendorDiscountCouponById);
router.put('/update/:id', auth, validateParams(getVendorDiscountCouponByIdSchema), validateBody(updateVendorDiscountCouponSchema), updateVendorDiscountCoupon);
router.delete('/delete/:id', auth, validateParams(getVendorDiscountCouponByIdSchema), deleteVendorDiscountCoupon);
router.get('/getByAuth', auth, validateQuery(getVendorDiscountCouponsByAuthSchema), getVendorDiscountCouponsByAuth);
router.get('/getByCategoryId/:Category_id', validateParams(getVendorDiscountCouponsByCategoryIdParamsSchema), validateQuery(getVendorDiscountCouponsByCategoryIdQuerySchema), getVendorDiscountCouponsByCategoryId);
router.get('/getByDiscountType/:DiscountType', validateParams(getVendorDiscountCouponsByDiscountTypeParamsSchema), validateQuery(getVendorDiscountCouponsByDiscountTypeQuerySchema), getVendorDiscountCouponsByDiscountType);
router.get('/getByCouponType/:Coupontype', validateParams(getVendorDiscountCouponsByCouponTypeParamsSchema), validateQuery(getVendorDiscountCouponsByCouponTypeQuerySchema), getVendorDiscountCouponsByCouponType);

module.exports = router;

