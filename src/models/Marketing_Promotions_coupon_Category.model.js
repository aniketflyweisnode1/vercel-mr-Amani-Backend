const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const marketingPromotionsCouponCategorySchema = new mongoose.Schema({
  Marketing_Promotions_coupon_Category_id: {
    type: Number,
    unique: true
  },
  CategoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [200, 'Category name cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
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

marketingPromotionsCouponCategorySchema.index({ Marketing_Promotions_coupon_Category_id: 1 });
marketingPromotionsCouponCategorySchema.index({ CategoryName: 1 });
marketingPromotionsCouponCategorySchema.index({ business_Branch_id: 1 });
marketingPromotionsCouponCategorySchema.index({ Status: 1 });

marketingPromotionsCouponCategorySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

marketingPromotionsCouponCategorySchema.plugin(AutoIncrement, {
  inc_field: 'Marketing_Promotions_coupon_Category_id',
  start_seq: 1
});

module.exports = mongoose.model('Marketing_Promotions_coupon_Category', marketingPromotionsCouponCategorySchema);

