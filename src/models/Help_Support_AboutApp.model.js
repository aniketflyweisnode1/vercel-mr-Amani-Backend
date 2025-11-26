const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpSupportAboutAppSchema = new mongoose.Schema({
  Help_Support_AboutApp_id: {
    type: Number,
    unique: true
  },
  Branch_Id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  logo: {
    type: String,
    trim: true,
    maxlength: [500, 'Logo path cannot exceed 500 characters']
  },
  aboutus: {
    type: String,
    trim: true,
    maxlength: [5000, 'About us cannot exceed 5000 characters']
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

helpSupportAboutAppSchema.index({ Help_Support_AboutApp_id: 1 });
helpSupportAboutAppSchema.index({ Branch_Id: 1 });
helpSupportAboutAppSchema.index({ Status: 1 });

helpSupportAboutAppSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpSupportAboutAppSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

helpSupportAboutAppSchema.plugin(AutoIncrement, { inc_field: 'Help_Support_AboutApp_id', start_seq: 1 });

module.exports = mongoose.model('Help_Support_AboutApp', helpSupportAboutAppSchema);

