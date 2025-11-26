const Joi = require('joi');

const idAlternative = Joi.alternatives().try(
  Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  Joi.string().pattern(/^\d+$/),
  Joi.number().integer().positive()
);

const timeString = Joi.string()
  .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  .message('Time must be in HH:MM 24-hour format');

const couponTypeSchema = Joi.object({
  PublicCoupon: Joi.boolean().optional(),
  PrivateCoupon: Joi.boolean().optional()
}).optional();

const discountTypeSchema = Joi.object({
  FlatDiscount: Joi.boolean().optional(),
  PercentageDiscoount: Joi.boolean().optional()
}).optional();

const productArraySchema = Joi.array()
  .items(
    Joi.number()
      .integer()
      .positive()
      .messages({
        'number.base': 'Product ID must be a number',
        'number.integer': 'Product ID must be an integer',
        'number.positive': 'Product ID must be a positive number'
      })
  )
  .unique()
  .messages({
    'array.base': 'SelectanyProduct must be an array',
    'array.unique': 'SelectanyProduct contains duplicate entries'
  });

const createMarketingCouponSchema = Joi.object({
  Offername: Joi.string().trim().min(2).max(200).required().messages({
    'string.empty': 'Offer name is required',
    'string.min': 'Offer name must have at least 2 characters',
    'string.max': 'Offer name cannot exceed 200 characters',
    'any.required': 'Offer name is required'
  }),
  DiscountCode: Joi.string().trim().min(3).max(50).regex(/^[A-Za-z0-9-_]+$/).uppercase().required().messages({
    'string.empty': 'Discount code is required',
    'string.pattern.base': 'Discount code can only contain letters, numbers, dashes, and underscores',
    'string.min': 'Discount code must have at least 3 characters',
    'string.max': 'Discount code cannot exceed 50 characters',
    'any.required': 'Discount code is required'
  }),
  Image: Joi.string().trim().uri().optional().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  Description: Joi.string().trim().max(2000).optional().allow('').messages({
    'string.max': 'Description cannot exceed 2000 characters'
  }),
  Marketing_Promotions_coupon_Category_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Coupon category ID must be a number',
    'number.integer': 'Coupon category ID must be an integer',
    'number.positive': 'Coupon category ID must be a positive number',
    'any.required': 'Coupon category ID is required'
  }),
  business_Branch_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Business branch ID must be a number',
    'number.integer': 'Business branch ID must be an integer',
    'number.positive': 'Business branch ID must be a positive number'
  }),
  SelectanyProduct: productArraySchema.optional(),
  CouponType: couponTypeSchema,
  UseNoofTime: Joi.number().integer().min(0).default(0).optional().messages({
    'number.base': 'UseNoofTime must be a number',
    'number.integer': 'UseNoofTime must be an integer',
    'number.min': 'UseNoofTime cannot be negative'
  }),
  setUnlimitedTimeUse: Joi.boolean().optional(),
  Visibility: Joi.boolean().optional(),
  DiscountType: discountTypeSchema,
  flatDiscountAmount: Joi.number().min(0).optional().messages({
    'number.base': 'flatDiscountAmount must be a number',
    'number.min': 'flatDiscountAmount cannot be negative'
  }),
  StartDate: Joi.date().iso().optional().messages({
    'date.base': 'StartDate must be a valid date',
    'date.format': 'StartDate must be in ISO format'
  }),
  StartTime: timeString.optional().allow(''),
  ExpirationDate: Joi.date().iso().optional().messages({
    'date.base': 'ExpirationDate must be a valid date',
    'date.format': 'ExpirationDate must be in ISO format'
  }),
  ExpirationTime: timeString.optional().allow(''),
  ValidityLifeTime: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

const updateMarketingCouponSchema = Joi.object({
  Offername: Joi.string().trim().min(2).max(200).optional(),
  DiscountCode: Joi.string().trim().min(3).max(50).regex(/^[A-Za-z0-9-_]+$/).uppercase().optional(),
  Image: Joi.string().trim().uri().optional().allow(''),
  Description: Joi.string().trim().max(2000).optional().allow(''),
  Marketing_Promotions_coupon_Category_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  SelectanyProduct: productArraySchema.optional(),
  CouponType: couponTypeSchema,
  UseNoofTime: Joi.number().integer().min(0).optional(),
  setUnlimitedTimeUse: Joi.boolean().optional(),
  Visibility: Joi.boolean().optional(),
  DiscountType: discountTypeSchema,
  flatDiscountAmount: Joi.number().min(0).optional(),
  StartDate: Joi.date().iso().optional(),
  StartTime: timeString.optional().allow(''),
  ExpirationDate: Joi.date().iso().optional(),
  ExpirationTime: timeString.optional().allow(''),
  ValidityLifeTime: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getMarketingCouponByIdSchema = Joi.object({
  id: idAlternative.required().messages({
    'alternatives.match': 'Coupon ID must be a valid ObjectId or positive number',
    'any.required': 'Coupon ID is required'
  })
});

const baseListQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(200).optional().allow(''),
  status: Joi.boolean().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  couponType: Joi.string().valid('PublicCoupon', 'PrivateCoupon').optional(),
  discountType: Joi.string().valid('FlatDiscount', 'PercentageDiscoount').optional(),
  visibility: Joi.boolean().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  product_id: Joi.number().integer().positive().optional(),
  business_Branch_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid(
    'Offername',
    'DiscountCode',
    'StartDate',
    'ExpirationDate',
    'created_at',
    'Marketing_Promotions_coupon_id'
  ).default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

const getAllMarketingCouponsSchema = Joi.object({
  ...baseListQuery
});

const getMarketingCouponsByAuthSchema = Joi.object({
  ...baseListQuery
});

const getMarketingCouponsByDiscountTypeParamsSchema = Joi.object({
  type: Joi.string().valid('FlatDiscount', 'PercentageDiscoount').required().messages({
    'any.only': 'Type must be either FlatDiscount or PercentageDiscoount',
    'any.required': 'Discount type is required'
  })
});

const getMarketingCouponsByDiscountTypeQuerySchema = Joi.object({
  page: baseListQuery.page,
  limit: baseListQuery.limit,
  status: baseListQuery.status,
  search: baseListQuery.search,
  visibility: baseListQuery.visibility,
  categoryId: baseListQuery.categoryId,
  product_id: baseListQuery.product_id,
  business_Branch_id: baseListQuery.business_Branch_id,
  sortBy: baseListQuery.sortBy,
  sortOrder: baseListQuery.sortOrder
});

const getMarketingCouponsByCouponTypeParamsSchema = Joi.object({
  type: Joi.string().valid('PublicCoupon', 'PrivateCoupon').required().messages({
    'any.only': 'Type must be either PublicCoupon or PrivateCoupon',
    'any.required': 'Coupon type is required'
  })
});

const getMarketingCouponsByCouponTypeQuerySchema = Joi.object({
  page: baseListQuery.page,
  limit: baseListQuery.limit,
  status: baseListQuery.status,
  search: baseListQuery.search,
  visibility: baseListQuery.visibility,
  categoryId: baseListQuery.categoryId,
  product_id: baseListQuery.product_id,
  business_Branch_id: baseListQuery.business_Branch_id,
  sortBy: baseListQuery.sortBy,
  sortOrder: baseListQuery.sortOrder
});

const getMarketingCouponsByCategoryParamsSchema = Joi.object({
  Marketing_Promotions_coupon_Category_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Coupon category ID must be a number',
    'number.integer': 'Coupon category ID must be an integer',
    'number.positive': 'Coupon category ID must be a positive number',
    'any.required': 'Coupon category ID is required'
  })
});

const getMarketingCouponsByCategoryQuerySchema = Joi.object({
  ...baseListQuery,
  categoryId: Joi.forbidden()
}).messages({
  'any.unknown': 'Coupon category ID should be provided in the route parameter'
});

module.exports = {
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
};

