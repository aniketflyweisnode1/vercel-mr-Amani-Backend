const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const platformsSchema = new mongoose.Schema({
  showTalk: { type: Boolean, default: false },
  instagram: { type: Boolean, default: false },
  facebook: { type: Boolean, default: false },
  ourApp: { type: Boolean, default: false }
}, { _id: false });

const socialMediaLiveSchema = new mongoose.Schema({
  SocialMedia_Live_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  liveSubject: {
    type: String,
    trim: true,
    maxlength: [500, 'Live subject cannot exceed 500 characters'],
    required: [true, 'Live subject is required']
  },
  liveDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Live description cannot exceed 2000 characters']
  },
  PlatForms: {
    type: platformsSchema,
    default: () => ({})
  },
  Reel_Id: {
    type: Number,
    ref: 'Reel',
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

socialMediaLiveSchema.index({ SocialMedia_Live_id: 1 });
socialMediaLiveSchema.index({ business_Branch_id: 1 });
socialMediaLiveSchema.index({ Reel_Id: 1 });
socialMediaLiveSchema.index({ Status: 1 });

socialMediaLiveSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

socialMediaLiveSchema.plugin(AutoIncrement, {
  inc_field: 'SocialMedia_Live_id',
  start_seq: 1
});

module.exports = mongoose.model('SocialMedia_Live', socialMediaLiveSchema);

