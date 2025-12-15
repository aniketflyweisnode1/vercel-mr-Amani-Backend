const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const postEntrySchema = new mongoose.Schema({
  Picture: {
    type: String,
    trim: true,
    default: ''
  },
  Video: {
    type: String,
    trim: true,
    default: ''
  },
  Live: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false });

const campaignAllneedaPostSchema = new mongoose.Schema({
  CampaignAllneedaPost_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    required: [true, 'Business branch ID is required']
  },
  Post: {
    type: [postEntrySchema],
    default: []
  },
  Caption: {
    type: String,
    trim: true,
    maxlength: [500, 'Caption cannot exceed 500 characters']
  },
  Tag: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.every(value => typeof value === 'string');
      },
      message: 'Tags must be an array of strings'
    }
  },
  Music: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.every(value => typeof value === 'string');
      },
      message: 'Music must be an array of strings'
    }
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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

campaignAllneedaPostSchema.index({ CampaignAllneedaPost_id: 1 });
campaignAllneedaPostSchema.index({ business_Branch_id: 1 });
campaignAllneedaPostSchema.index({ Status: 1 });

campaignAllneedaPostSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

campaignAllneedaPostSchema.plugin(AutoIncrement, {
  inc_field: 'CampaignAllneedaPost_id',
  start_seq: 1
});

module.exports = mongoose.model('CampaignAllneedaPost', campaignAllneedaPostSchema);

