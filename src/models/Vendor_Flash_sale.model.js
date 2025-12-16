const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorFlashSaleSchema = new mongoose.Schema({
  Vendor_Flash_sale_id: {
    type: Number,
    unique: true
  },
  Vendor_Store_id: {
    type: Number,
    required: [true, 'Vendor Store ID is required']
  },
  Vendor_Product_id: {
    type: Number,
    required: [true, 'Vendor Product ID is required']
  },
  SaleDate: {
    type: Date,
    required: [true, 'Sale date is required']
  },
  StartTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  EndTime: {
    type: Date,
    required: [true, 'End time is required']
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
vendorFlashSaleSchema.index({ Vendor_Flash_sale_id: 1 });
vendorFlashSaleSchema.index({ Vendor_Store_id: 1 });
vendorFlashSaleSchema.index({ Vendor_Product_id: 1 });
vendorFlashSaleSchema.index({ Status: 1 });
vendorFlashSaleSchema.index({ SaleDate: 1 });

// Pre-save middleware to update updated_at timestamp
vendorFlashSaleSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Flash_sale_id
vendorFlashSaleSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Flash_sale_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Flash_sale', vendorFlashSaleSchema);
