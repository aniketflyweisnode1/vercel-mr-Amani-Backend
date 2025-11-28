const Joi = require('joi');

const createVendorDiscountCouponSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  Coupon_image: Joi.string().trim().max(500).optional().allow(''),
  offerName: Joi.string().trim().max(200).required(),
  Discountcode: Joi.string().trim().max(50).required(),
  Category_id: Joi.number().integer().positive().optional().allow(null),
  AnyProduct: Joi.boolean().optional().default(false),
  Coupontype: Joi.string().valid('Public', 'Private').default('Public').optional(),
  NooftimesUsed: Joi.number().integer().min(0).optional().default(0),
  timeUnlimited: Joi.boolean().optional().default(false),
  Visibility: Joi.boolean().optional().default(false),
  DiscountType: Joi.string().valid('Flat', 'Percentage').default('Flat').optional(),
  FlatDiscountAmount: Joi.number().min(0).optional(),
  StartDate: Joi.date().optional().allow(null),
  StartTime: Joi.string().trim().max(20).optional().allow(''),
  ExpirationDate: Joi.date().optional().allow(null),
  ExpirationTime: Joi.string().trim().max(20).optional().allow(''),
  Validitylifetime: Joi.boolean().optional().default(false),
  Status: Joi.boolean().optional().default(true)
});

const updateVendorDiscountCouponSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  Coupon_image: Joi.string().trim().max(500).optional().allow(''),
  offerName: Joi.string().trim().max(200).optional(),
  Discountcode: Joi.string().trim().max(50).optional(),
  Category_id: Joi.number().integer().positive().optional().allow(null),
  AnyProduct: Joi.boolean().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  NooftimesUsed: Joi.number().integer().min(0).optional(),
  timeUnlimited: Joi.boolean().optional(),
  Visibility: Joi.boolean().optional(),
  DiscountType: Joi.string().valid('Flat', 'Percentage').optional(),
  FlatDiscountAmount: Joi.number().min(0).optional(),
  StartDate: Joi.date().optional().allow(null),
  StartTime: Joi.string().trim().max(20).optional().allow(''),
  ExpirationDate: Joi.date().optional().allow(null),
  ExpirationTime: Joi.string().trim().max(20).optional().allow(''),
  Validitylifetime: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1);

const getVendorDiscountCouponByIdSchema = Joi.object({
  id: Joi.alternatives().try(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    Joi.string().pattern(/^\d+$/),
    Joi.number().integer().positive()
  ).required()
});

const getAllVendorDiscountCouponsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  DiscountType: Joi.string().valid('Flat', 'Percentage').optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Discount_Coupon_id', 'offerName', 'StartDate', 'ExpirationDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorDiscountCouponsByAuthSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  DiscountType: Joi.string().valid('Flat', 'Percentage').optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Discount_Coupon_id', 'offerName', 'StartDate', 'ExpirationDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorDiscountCouponsByCategoryIdParamsSchema = Joi.object({
  Category_id: Joi.number().integer().positive().required()
});

const getVendorDiscountCouponsByCategoryIdQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  DiscountType: Joi.string().valid('Flat', 'Percentage').optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Discount_Coupon_id', 'offerName', 'StartDate', 'ExpirationDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorDiscountCouponsByDiscountTypeParamsSchema = Joi.object({
  DiscountType: Joi.string().valid('Flat', 'Percentage').required()
});

const getVendorDiscountCouponsByDiscountTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  Coupontype: Joi.string().valid('Public', 'Private').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Discount_Coupon_id', 'offerName', 'StartDate', 'ExpirationDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const getVendorDiscountCouponsByCouponTypeParamsSchema = Joi.object({
  Coupontype: Joi.string().valid('Public', 'Private').required()
});

const getVendorDiscountCouponsByCouponTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional(),
  status: Joi.boolean().optional(),
  user_id: Joi.number().integer().positive().optional(),
  Category_id: Joi.number().integer().positive().optional(),
  DiscountType: Joi.string().valid('Flat', 'Percentage').optional(),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'Vendor_Discount_Coupon_id', 'offerName', 'StartDate', 'ExpirationDate').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
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
};

