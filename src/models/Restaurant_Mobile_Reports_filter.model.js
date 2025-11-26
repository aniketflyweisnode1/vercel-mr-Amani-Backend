const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantMobileReportsFilterSchema = new mongoose.Schema({
  Restaurant_Mobile_Reports_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  ReportsFor: {
    type: String,
    trim: true,
    maxlength: [200, 'ReportsFor cannot exceed 200 characters']
  },
  ReportsType: {
    type: String,
    trim: true,
    maxlength: [200, 'ReportsType cannot exceed 200 characters']
  },
  StartDate: {
    type: Date,
    default: null
  },
  EndDate: {
    type: Date,
    default: null
  },
  DayofWeek: {
    type: String,
    trim: true,
    maxlength: [50, 'DayofWeek cannot exceed 50 characters']
  },
  providers: {
    type: String,
    trim: true,
    maxlength: [200, 'Providers cannot exceed 200 characters']
  },
  BrackdownbyBrand: {
    type: Boolean,
    default: false
  },
  BrackDownByBrand_Branches: {
    type: String,
    trim: true,
    maxlength: [500, 'BrackDownByBrand_Branches cannot exceed 500 characters']
  },
  BrackownByBranches: {
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

restaurantMobileReportsFilterSchema.index({ Restaurant_Mobile_Reports_id: 1 });
restaurantMobileReportsFilterSchema.index({ business_Branch_id: 1 });
restaurantMobileReportsFilterSchema.index({ ReportsFor: 1 });
restaurantMobileReportsFilterSchema.index({ ReportsType: 1 });
restaurantMobileReportsFilterSchema.index({ Status: 1 });
restaurantMobileReportsFilterSchema.index({ StartDate: 1 });
restaurantMobileReportsFilterSchema.index({ EndDate: 1 });

restaurantMobileReportsFilterSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantMobileReportsFilterSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantMobileReportsFilterSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Mobile_Reports_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Mobile_Reports_filter', restaurantMobileReportsFilterSchema);

