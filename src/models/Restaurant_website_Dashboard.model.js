const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteDashboardSchema = new mongoose.Schema({
  Restaurant_website_Dashboard_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  AcitvewebSite: {
    type: Number,
    default: 0,
    min: [0, 'Active website count cannot be negative']
  },
  InacitvewebSite: {
    type: Number,
    default: 0,
    min: [0, 'Inactive website count cannot be negative']
  },
  MonthlyVisitoers: {
    type: Number,
    default: 0,
    min: [0, 'Monthly visitors cannot be negative']
  },
  TotalOrders: {
    type: Number,
    default: 0,
    min: [0, 'Total orders cannot be negative']
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

restaurantWebsiteDashboardSchema.index({ Restaurant_website_Dashboard_id: 1 });
restaurantWebsiteDashboardSchema.index({ business_Branch_id: 1 });
restaurantWebsiteDashboardSchema.index({ Status: 1 });

restaurantWebsiteDashboardSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteDashboardSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteDashboardSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_Dashboard_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_Dashboard', restaurantWebsiteDashboardSchema);


