const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationSchema = new mongoose.Schema({
  Type: {
    type: String,
    required: [true, 'Notification type is required'],
    trim: true
  },
  Status: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const profileSettingSchema = new mongoose.Schema({
  Profile_setting_id: {
    type: Number,
    unique: true
  },
  User_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // One profile setting per user
  },
  SmsAlerts: {
    type: Boolean,
    default: false
  },
  appTheme: {
    type: String,
    enum: ['Red & White', 'Blue & White'],
    default: 'Red & White',
    trim: true
  },
  TermsCondition: {
    type: Boolean,
    default: false
  },
  PrivacyPolicy: {
    type: Boolean,
    default: false
  },
  Notification: {
    type: [notificationSchema],
    default: []
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

// Index for better query performance
profileSettingSchema.index({ Profile_setting_id: 1 });
profileSettingSchema.index({ User_id: 1 });
profileSettingSchema.index({ Status: 1 });
profileSettingSchema.index({ created_at: 1 });

// Pre-save middleware to update updated_at timestamp
profileSettingSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let ProfileSettingModel;
try {
  ProfileSettingModel = mongoose.model('Profile_setting');
} catch (error) {
  profileSettingSchema.plugin(AutoIncrement, { inc_field: 'Profile_setting_id', start_seq: 1 });
  ProfileSettingModel = mongoose.model('Profile_setting', profileSettingSchema);
}

module.exports = ProfileSettingModel;

