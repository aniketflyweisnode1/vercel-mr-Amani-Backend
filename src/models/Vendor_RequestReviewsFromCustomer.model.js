const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorRequestReviewsFromCustomerSchema = new mongoose.Schema({
  Vendor_RequestReviewsFromCustomer_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  country_id: {
    type: Number,
    ref: 'Country',
    default: null
  },
  phoneno: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email cannot exceed 200 characters']
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
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

vendorRequestReviewsFromCustomerSchema.index({ Vendor_RequestReviewsFromCustomer_id: 1 });
vendorRequestReviewsFromCustomerSchema.index({ country_id: 1 });
vendorRequestReviewsFromCustomerSchema.index({ Status: 1 });
vendorRequestReviewsFromCustomerSchema.index({ created_by: 1 });
vendorRequestReviewsFromCustomerSchema.index({ email: 1 });
vendorRequestReviewsFromCustomerSchema.index({ phoneno: 1 });

vendorRequestReviewsFromCustomerSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorRequestReviewsFromCustomerSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorRequestReviewsFromCustomerSchema.plugin(AutoIncrement, { inc_field: 'Vendor_RequestReviewsFromCustomer_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_RequestReviewsFromCustomer', vendorRequestReviewsFromCustomerSchema);

