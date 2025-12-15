const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const campaignTypeSchema = new mongoose.Schema({
  CampaignType_id: {
    type: Number,
    unique: true
  },
  CampaignTypeName: {
    type: String,
    required: [true, 'Campaign type name is required'],
    trim: true,
    maxlength: [200, 'Campaign type name cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  Status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
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

campaignTypeSchema.index({ CampaignType_id: 1 });
campaignTypeSchema.index({ CampaignTypeName: 1 });
campaignTypeSchema.index({ Status: 1 });

campaignTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

campaignTypeSchema.plugin(AutoIncrement, {
  inc_field: 'CampaignType_id',
  start_seq: 1
});

module.exports = mongoose.model('CampaignType', campaignTypeSchema);

