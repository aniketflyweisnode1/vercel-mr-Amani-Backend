const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorProductSubCategorySchema = new mongoose.Schema({
  Vendor_Product_SubCategory_id: {
    type: Number,
    unique: true
  },
  Vendor_Product_Category_id: {
    type: Number,
    ref: 'Vendor_Product_Category',
    required: [true, 'Vendor Product Category ID is required']
  },
  SubCategoryName: {
    type: String,
    required: [true, 'Sub category name is required'],
    trim: true,
    maxlength: [200, 'Sub category name cannot exceed 200 characters']
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

// Index for better query performance
vendorProductSubCategorySchema.index({ Vendor_Product_SubCategory_id: 1 });
vendorProductSubCategorySchema.index({ Vendor_Product_Category_id: 1 });
vendorProductSubCategorySchema.index({ Status: 1 });
vendorProductSubCategorySchema.index({ SubCategoryName: 1 });

// Pre-save middleware to update updated_at timestamp
vendorProductSubCategorySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Product_SubCategory_id
vendorProductSubCategorySchema.plugin(AutoIncrement, { inc_field: 'Vendor_Product_SubCategory_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Product_SubCategory', vendorProductSubCategorySchema);

