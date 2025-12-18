const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewStatusEnum = ['Excellent', 'Good', 'Average', 'Poor'];

const vendorProductsReviewSchema = new mongoose.Schema({
  Vendor_Products_Reviews_id: {
    type: Number,
    unique: true
  },
  Vendor_Store_id: {
    type: Number,
    ref: 'Vendor_Store',
    required: [true, 'Vendor store ID is required']
  },
  Vendor_Products_id: {
    type: Number,
    ref: 'Vendor_Products',
    required: [true, 'Vendor product ID is required']
  },
  Reating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ReviewsStatus: {
    type: String,
    enum: reviewStatusEnum,
    default: 'Poor'
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  User_id: {
    type: Number,
    ref: 'User',
    default: null
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

vendorProductsReviewSchema.index({ Vendor_Products_Reviews_id: 1 });
vendorProductsReviewSchema.index({ Vendor_Store_id: 1 });
vendorProductsReviewSchema.index({ Vendor_Products_id: 1 });
vendorProductsReviewSchema.index({ Status: 1 });

vendorProductsReviewSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorProductsReviewSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorProductsReviewSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Products_Reviews_id', start_seq: 1 });

function mapRatingToStatus(rating) {
  if (rating >= 5) return 'Excellent';
  if (rating >= 4) return 'Good';
  if (rating >= 2) return 'Average';
  if (rating >= 1) return 'Poor';
  return 'Poor';
}

module.exports = mongoose.model('Vendor_Products_Reviews', vendorProductsReviewSchema);


