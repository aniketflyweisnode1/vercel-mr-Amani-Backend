const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const TARGET_SEGMENTS = ['All customers', 'VIP', 'RequentCustomers'];

const marketingPromotionsSmsCampaignSchema = new mongoose.Schema({
  Marketing_Promotions_SMSCampaign_id: {
    type: Number,
    unique: true
  },
  Campaignname: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [200, 'Campaign name cannot exceed 200 characters']
  },
  CampaignType_id: {
    type: Number,
    ref: 'CampaignType',
    required: [true, 'Campaign type is required']
  },
  TargetCustomerSegment: {
    type: String,
    enum: TARGET_SEGMENTS,
    required: [true, 'Target customer segment is required']
  },
  City_id: {
    type: Number,
    ref: 'City',
    required: [true, 'City is required']
  },
  ScheduleSend: {
    type: Boolean,
    default: false
  },
  PromoCode: {
    type: String,
    trim: true,
    default: ''
  },
  CallToActionLink: {
    type: String,
    trim: true,
    default: ''
  },
  Notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: ''
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    default: null
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    default: null
  },
  Vendor_Store_id: {
    type: Number,
    ref: 'Vendor_Store',
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

marketingPromotionsSmsCampaignSchema.index({ Marketing_Promotions_SMSCampaign_id: 1 });
marketingPromotionsSmsCampaignSchema.index({ CampaignType_id: 1 });
marketingPromotionsSmsCampaignSchema.index({ Branch_id: 1 });
marketingPromotionsSmsCampaignSchema.index({ business_Branch_id: 1 });
marketingPromotionsSmsCampaignSchema.index({ Vendor_Store_id: 1 });
marketingPromotionsSmsCampaignSchema.index({ TargetCustomerSegment: 1 });
marketingPromotionsSmsCampaignSchema.index({ Status: 1 });

marketingPromotionsSmsCampaignSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

marketingPromotionsSmsCampaignSchema.plugin(AutoIncrement, {
  inc_field: 'Marketing_Promotions_SMSCampaign_id',
  start_seq: 1
});

module.exports = mongoose.model('Marketing_Promotions_SMSCampaign', marketingPromotionsSmsCampaignSchema);
module.exports.TARGET_SEGMENTS = TARGET_SEGMENTS;

