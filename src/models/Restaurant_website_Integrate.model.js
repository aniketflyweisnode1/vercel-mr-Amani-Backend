const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteIntegrateSchema = new mongoose.Schema({
  Restaurant_website_Integrate_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  websiteName: {
    type: String,
    required: [true, 'Website name is required'],
    trim: true,
    maxlength: [150, 'Website name cannot exceed 150 characters']
  },
  websiteUrl: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true,
    maxlength: [500, 'Website URL cannot exceed 500 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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

restaurantWebsiteIntegrateSchema.index({ Restaurant_website_Integrate_id: 1 });
restaurantWebsiteIntegrateSchema.index({ business_Branch_id: 1 });
restaurantWebsiteIntegrateSchema.index({ websiteUrl: 1 });
restaurantWebsiteIntegrateSchema.index({ Status: 1 });

restaurantWebsiteIntegrateSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteIntegrateSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteIntegrateSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_Integrate_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_Integrate', restaurantWebsiteIntegrateSchema);


