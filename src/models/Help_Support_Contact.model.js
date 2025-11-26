const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpSupportContactSchema = new mongoose.Schema({
  Help_Support_Contact_id: {
    type: Number,
    unique: true
  },
  Branch_Id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  MobileNo: {
    type: String,
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  Callus: {
    type: String,
    trim: true,
    maxlength: [20, 'Call us number cannot exceed 20 characters']
  },
  Emailaddress: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    maxlength: [200, 'Email address cannot exceed 200 characters']
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

helpSupportContactSchema.index({ Help_Support_Contact_id: 1 });
helpSupportContactSchema.index({ Branch_Id: 1 });
helpSupportContactSchema.index({ Status: 1 });

helpSupportContactSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpSupportContactSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

helpSupportContactSchema.plugin(AutoIncrement, { inc_field: 'Help_Support_Contact_id', start_seq: 1 });

module.exports = mongoose.model('Help_Support_Contact', helpSupportContactSchema);

