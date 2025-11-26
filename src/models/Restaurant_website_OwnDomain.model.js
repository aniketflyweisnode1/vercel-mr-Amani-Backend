const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteOwnDomainSchema = new mongoose.Schema({
  Restaurant_website_OwnDomain_id: {
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
    trim: true,
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

restaurantWebsiteOwnDomainSchema.index({ Restaurant_website_OwnDomain_id: 1 });
restaurantWebsiteOwnDomainSchema.index({ business_Branch_id: 1 });
restaurantWebsiteOwnDomainSchema.index({ subdomain: 1 });
restaurantWebsiteOwnDomainSchema.index({ Restaurant_website_Template_id: 1 });
restaurantWebsiteOwnDomainSchema.index({ Status: 1 });

restaurantWebsiteOwnDomainSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteOwnDomainSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteOwnDomainSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_OwnDomain_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_OwnDomain', restaurantWebsiteOwnDomainSchema);


