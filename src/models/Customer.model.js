const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const customerSchema = new mongoose.Schema({
  Customer_id: {
    type: Number,
    unique: true
  },
  service_id: {
    type: Number,
    ref: 'Services',
    required: [true, 'Service ID is required']
  },
  FullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [200, 'Full name cannot exceed 200 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Customer_image: {
    type: String,
    trim: true
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
customerSchema.index({ Customer_id: 1 });
customerSchema.index({ service_id: 1 });
customerSchema.index({ Branch_id: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ mobile: 1 });
customerSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
customerSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Customer_id
customerSchema.plugin(AutoIncrement, { inc_field: 'Customer_id', start_seq: 1 });

module.exports = mongoose.model('Customer', customerSchema);

