const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const booleanFlag = {
  type: Boolean,
  default: false
};

const timeStringValidator = {
  validator: function (value) {
    if (!value) return true;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
  },
  message: 'Time must be in HH:MM 24-hour format'
};

const marketingPromotionsCouponSchema = new mongoose.Schema({
  Marketing_Promotions_coupon_id: {
    type: Number,
    unique: true
  },
  Offername: {
    type: String,
    required: [true, 'Offer name is required'],
    trim: true,
    maxlength: [200, 'Offer name cannot exceed 200 characters']
  },
  DiscountCode: {
    type: String,
    required: [true, 'Discount code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [50, 'Discount code cannot exceed 50 characters']
  },
  Image: {
    type: String,
    trim: true,
    default: ''
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  Marketing_Promotions_coupon_Category_id: {
    type: Number,
    ref: 'Marketing_Promotions_coupon_Category',
    required: [true, 'Coupon category is required']
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  SelectanyProduct: {
    type: [Number],
    ref: 'Item',
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.every(id => Number.isInteger(id) && id > 0);
      },
      message: 'SelectanyProduct must be an array of positive integers'
    }
  },
  CouponType: {
    PublicCoupon: booleanFlag,
    PrivateCoupon: booleanFlag
  },
  UseNoofTime: {
    type: Number,
    min: [0, 'UseNoofTime cannot be negative'],
    default: 0
  },
  setUnlimitedTimeUse: {
    type: Boolean,
    default: false
  },
  Visibility: {
    type: Boolean,
    default: false
  },
  DiscountType: {
    FlatDiscount: booleanFlag,
    PercentageDiscoount: booleanFlag
  },
  flatDiscountAmount: {
    type: Number,
    min: [0, 'flatDiscountAmount cannot be negative'],
    default: 0
  },
  StartDate: {
    type: Date,
    default: null
  },
  StartTime: {
    type: String,
    trim: true,
    validate: timeStringValidator
  },
  ExpirationDate: {
    type: Date,
    default: null
  },
  ExpirationTime: {
    type: String,
    trim: true,
    validate: timeStringValidator
  },
  ValidityLifeTime: {
    type: Boolean,
    default: false
  },
  Status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

marketingPromotionsCouponSchema.index({ Marketing_Promotions_coupon_id: 1 });
marketingPromotionsCouponSchema.index({ DiscountCode: 1 });
marketingPromotionsCouponSchema.index({ Marketing_Promotions_coupon_Category_id: 1 });
marketingPromotionsCouponSchema.index({ business_Branch_id: 1 });
marketingPromotionsCouponSchema.index({ Status: 1 });
marketingPromotionsCouponSchema.index({ 'CouponType.PublicCoupon': 1 });
marketingPromotionsCouponSchema.index({ 'CouponType.PrivateCoupon': 1 });
marketingPromotionsCouponSchema.index({ 'DiscountType.FlatDiscount': 1 });
marketingPromotionsCouponSchema.index({ 'DiscountType.PercentageDiscoount': 1 });

marketingPromotionsCouponSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

marketingPromotionsCouponSchema.plugin(AutoIncrement, {
  inc_field: 'Marketing_Promotions_coupon_id',
  start_seq: 1
});

module.exports = mongoose.model('Marketing_Promotions_coupon', marketingPromotionsCouponSchema);

