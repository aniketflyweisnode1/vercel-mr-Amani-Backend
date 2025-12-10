const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const needsAppSchema = new mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  },
  Status: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const settingsAppPartnersNeedsSchema = new mongoose.Schema({
  Settings_App_Partners_Needs_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Needs_App: {
    type: [needsAppSchema],
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

settingsAppPartnersNeedsSchema.index({ Settings_App_Partners_Needs_id: 1 });
settingsAppPartnersNeedsSchema.index({ Branch_id: 1 });
settingsAppPartnersNeedsSchema.index({ Status: 1 });

settingsAppPartnersNeedsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

settingsAppPartnersNeedsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let SettingsAppPartnersNeedsModel;
try {
  SettingsAppPartnersNeedsModel = mongoose.model('Settings_App_Partners_Needs');
} catch (error) {
  settingsAppPartnersNeedsSchema.plugin(AutoIncrement, { inc_field: 'Settings_App_Partners_Needs_id', start_seq: 1 });
  SettingsAppPartnersNeedsModel = mongoose.model('Settings_App_Partners_Needs', settingsAppPartnersNeedsSchema);
}

module.exports = SettingsAppPartnersNeedsModel;
