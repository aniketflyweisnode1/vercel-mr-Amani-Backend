const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const expensesSchema = new mongoose.Schema({
  Expense_id: {
    type: Number,
    unique: true
  },
  Expense_Name: {
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
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Date: {
    type: Date,
    required: [true, 'Date is required']
  },
  Details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Details cannot exceed 2000 characters'],
    default: ''
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

expensesSchema.index({ Expense_id: 1 });
expensesSchema.index({ Branch_id: 1 });
expensesSchema.index({ Date: 1 });
expensesSchema.index({ Status: 1 });
expensesSchema.index({ created_by: 1 });

expensesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

expensesSchema.plugin(AutoIncrement, { inc_field: 'Expense_id', start_seq: 1 });

module.exports = mongoose.model('Expenses', expensesSchema);


