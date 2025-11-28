const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorDiscountCouponSchema = new mongoose.Schema({
  Vendor_Discount_Coupon_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  Coupon_image: {
    type: String,
    trim: true,
    maxlength: [500, 'Coupon image path cannot exceed 500 characters']
  },
  offerName: {
    type: String,
    required: [true, 'Offer name is required'],
    trim: true,
    maxlength: [200, 'Offer name cannot exceed 200 characters']
  },
  Discountcode: {
    type: String,
    required: [true, 'Discount code is required'],
    trim: true,
    maxlength: [50, 'Discount code cannot exceed 50 characters']
  },
  Category_id: {
    type: Number,
    ref: 'Vendor_Product_Category',
    default: null
  },
  AnyProduct: {
    type: Boolean,
    default: false
  },
  Coupontype: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public',
    trim: true
  },
  NooftimesUsed: {
    type: Number,
    default: 0,
    min: [0, 'Number of times used cannot be negative']
  },
  timeUnlimited: {
    type: Boolean,
    default: false
  },
  Visibility: {
    type: Boolean,
    default: false
  },
  DiscountType: {
    type: String,
    enum: ['Flat', 'Percentage'],
    default: 'Flat',
    trim: true
  },
  FlatDiscountAmount: {
    type: Number,
    min: [0, 'Flat discount amount cannot be negative']
  },
  StartDate: {
    type: Date
  },
  StartTime: {
    type: String,
    trim: true,
    maxlength: [20, 'Start time cannot exceed 20 characters']
  },
  ExpirationDate: {
    type: Date
  },
  ExpirationTime: {
    type: String,
    trim: true,
    maxlength: [20, 'Expiration time cannot exceed 20 characters']
  },
  Validitylifetime: {
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

// Index for better query performance
vendorDiscountCouponSchema.index({ Vendor_Discount_Coupon_id: 1 });
vendorDiscountCouponSchema.index({ user_id: 1 });
vendorDiscountCouponSchema.index({ Category_id: 1 });
vendorDiscountCouponSchema.index({ DiscountType: 1 });
vendorDiscountCouponSchema.index({ Coupontype: 1 });
vendorDiscountCouponSchema.index({ Status: 1 });
vendorDiscountCouponSchema.index({ Discountcode: 1 });

// Pre-save middleware to update updated_at timestamp
vendorDiscountCouponSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Discount_Coupon_id
vendorDiscountCouponSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Discount_Coupon_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Discount_Coupon', vendorDiscountCouponSchema);

