const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const postFromSchema = new mongoose.Schema({
  PersonalId: { type: Boolean, default: false },
  BusinessPage: { type: Boolean, default: false }
}, { _id: false });

const platformsSchema = new mongoose.Schema({
  showTalk: { type: Boolean, default: false },
  instagram: { type: Boolean, default: false },
  facebook: { type: Boolean, default: false },
  ourApp: { type: Boolean, default: false }
}, { _id: false });

const socialMediaPostSchema = new mongoose.Schema({
  SocialMedia_Post_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  Content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  image_Video: {
    type: String,
    trim: true,
    default: ''
  },
  PostFrom: {
    type: postFromSchema,
    default: () => ({})
  },
  Platforms: {
    type: platformsSchema,
    default: () => ({})
  },
  Reel_Id: {
    type: Number,
    ref: 'Reel',
    default: null
  },
  ScheduleLater: {
    type: Boolean,
    default: false
  },
  ScheduleDate: {
    type: Date,
    default: null
  },
  ScheduleTime: {
    type: String,
    trim: true,
    maxlength: [20, 'Schedule time cannot exceed 20 characters'],
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

socialMediaPostSchema.index({ SocialMedia_Post_id: 1 });
socialMediaPostSchema.index({ business_Branch_id: 1 });
socialMediaPostSchema.index({ Reel_Id: 1 });
socialMediaPostSchema.index({ Status: 1 });

socialMediaPostSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

socialMediaPostSchema.plugin(AutoIncrement, {
  inc_field: 'SocialMedia_Post_id',
  start_seq: 1
});

module.exports = mongoose.model('SocialMedia_Post', socialMediaPostSchema);

