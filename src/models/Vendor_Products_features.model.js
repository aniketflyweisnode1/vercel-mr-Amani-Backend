const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorProductsFeaturesSchema = new mongoose.Schema({
  Vendor_Products_features_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
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

// Index for better query performance
vendorProductsFeaturesSchema.index({ Vendor_Products_features_id: 1 });
vendorProductsFeaturesSchema.index({ Status: 1 });
vendorProductsFeaturesSchema.index({ name: 1 });

// Pre-save middleware to update updated_at timestamp
vendorProductsFeaturesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Products_features_id
vendorProductsFeaturesSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Products_features_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Products_features', vendorProductsFeaturesSchema);
