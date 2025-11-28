const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorExpensesSchema = new mongoose.Schema({
  Vendor_Expenses_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  ExpenseName: {
    type: String,
    required: [true, 'Expense name is required'],
    trim: true,
    maxlength: [200, 'Expense name cannot exceed 200 characters']
  },
  Amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  Category_id: {
    type: Number,
    ref: 'Vendor_Product_Category',
    required: [true, 'Category ID is required']
  },
  Date: {
    type: Date,
    required: [true, 'Date is required']
  },
  Details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Details cannot exceed 2000 characters']
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
vendorExpensesSchema.index({ Vendor_Expenses_id: 1 });
vendorExpensesSchema.index({ user_id: 1 });
vendorExpensesSchema.index({ Category_id: 1 });
vendorExpensesSchema.index({ Date: 1 });
vendorExpensesSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
vendorExpensesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Expenses_id
vendorExpensesSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Expenses_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Expenses', vendorExpensesSchema);

