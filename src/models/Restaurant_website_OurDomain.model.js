const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteOurDomainSchema = new mongoose.Schema({
  Restaurant_website_id: {
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
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    trim: true,
    lowercase: true,
    maxlength: [150, 'Subdomain cannot exceed 150 characters']
  },
  Restaurant_website_Template_id: {
    type: Number,
    ref: 'Restaurant_website_Template',
    required: [true, 'Template ID is required']
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

restaurantWebsiteOurDomainSchema.index({ Restaurant_website_id: 1 });
restaurantWebsiteOurDomainSchema.index({ business_Branch_id: 1 });
restaurantWebsiteOurDomainSchema.index({ subdomain: 1 }, { unique: true });
restaurantWebsiteOurDomainSchema.index({ Restaurant_website_Template_id: 1 });
restaurantWebsiteOurDomainSchema.index({ Status: 1 });

restaurantWebsiteOurDomainSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteOurDomainSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteOurDomainSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_OurDomain', restaurantWebsiteOurDomainSchema);


