const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorProductCategorySchema = new mongoose.Schema({
  Vendor_Product_Category_id: {
    type: Number,
    unique: true
  },
  CategoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [200, 'Category name cannot exceed 200 characters']
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
vendorProductCategorySchema.index({ Vendor_Product_Category_id: 1 });
vendorProductCategorySchema.index({ Status: 1 });
vendorProductCategorySchema.index({ CategoryName: 1 });

// Pre-save middleware to update updated_at timestamp
vendorProductCategorySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Product_Category_id
vendorProductCategorySchema.plugin(AutoIncrement, { inc_field: 'Vendor_Product_Category_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Product_Category', vendorProductCategorySchema);

