const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const contactSupportSchema = new mongoose.Schema({
  ContactSupport_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  chat_supportNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Chat support number cannot exceed 50 characters']
  },
  CallUsNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Call us number cannot exceed 50 characters']
  },
  EmailSupport: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email support cannot exceed 200 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
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

contactSupportSchema.index({ ContactSupport_id: 1 });
contactSupportSchema.index({ Branch_id: 1 });
contactSupportSchema.index({ Status: 1 });
contactSupportSchema.index({ created_by: 1 });

contactSupportSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

contactSupportSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

contactSupportSchema.plugin(AutoIncrement, { inc_field: 'ContactSupport_id', start_seq: 1 });

module.exports = mongoose.model('ContactSupport', contactSupportSchema);

