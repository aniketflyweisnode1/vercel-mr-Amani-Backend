const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorReviewsDashboardSchema = new mongoose.Schema({
  Vendor_Items_Reviews_Dashboard_id: {
    type: Number,
    unique: true
  },
  Vendor_Store_id: {
    type: Number,
    ref: 'Vendor_Store',
    required: [true, 'Vendor Store ID is required']
  },
  OverallRating: {
    type: Number,
    default: 0,
    min: [0, 'Overall rating cannot be negative'],
    max: [5, 'Overall rating cannot exceed 5']
  },
  ExcellentCount: {
    type: Number,
    default: 0,
    min: [0, 'Excellent count cannot be negative']
  },
  GoodCount: {
    type: Number,
    default: 0,
    min: [0, 'Good count cannot be negative']
  },
  AverageCount: {
    type: Number,
    default: 0,
    min: [0, 'Average count cannot be negative']
  },
  PoorCount: {
    type: Number,
    default: 0,
    min: [0, 'Poor count cannot be negative']
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
vendorReviewsDashboardSchema.index({ Vendor_Items_Reviews_Dashboard_id: 1 });
vendorReviewsDashboardSchema.index({ Vendor_Store_id: 1 });
vendorReviewsDashboardSchema.index({ Status: 1 });
vendorReviewsDashboardSchema.index({ created_by: 1 });

// Pre-save middleware to update updated_at timestamp
vendorReviewsDashboardSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Pre-update middleware
vendorReviewsDashboardSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Auto-increment plugin for Vendor_Items_Reviews_Dashboard_id
let VendorReviewsDashboardModel;
try {
  VendorReviewsDashboardModel = mongoose.model('Vendor_Items_Reviews_Dashboard');
} catch (error) {
  vendorReviewsDashboardSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Items_Reviews_Dashboard_id', start_seq: 1 });
  VendorReviewsDashboardModel = mongoose.model('Vendor_Items_Reviews_Dashboard', vendorReviewsDashboardSchema);
}

module.exports = VendorReviewsDashboardModel;

