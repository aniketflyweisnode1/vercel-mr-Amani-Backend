const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: Number,
    unique: true
  },
  Plan_id: {
    type: Number,
    ref: 'Plan',
    default: null
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'requires_payment_method'],
    default: 'pending'
  },
  payment_method_id: {
    type: Number,
    ref: 'PaymentMethods',
    required: [true, 'Payment method ID is required']
  },
  transactionType: {
    type: String,
    enum: ['Registration_fee', 'deposit', 'withdraw', 'Plan_Buy', 'Recharge', 'refund'],
    required: [true, 'Transaction type is required']
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  reference_number: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference number cannot exceed 100 characters']
  },
  coupon_code_id: {
    type: Number,
    ref: 'CouponCode',
    default: null
  },
  CGST: {
    type: Number,
    default: 0,
    min: [0, 'CGST cannot be negative']
  },
  SGST: {
    type: Number,
    default: 0,
    min: [0, 'SGST cannot be negative']
  },
  TotalGST: {
    type: Number,
    default: 0,
    min: [0, 'Total GST cannot be negative']
  },
  metadata: {
    type: String,
    default: null,
    trim: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    default: null
  },
  bank_id: {
    type: Number,
    ref: 'BankName',
    default: null
  },
  bank_branch_id: {
    type: Number,
    ref: 'BankBranchName',
    default: null
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  fileDownlodedPath: {
    type: String,
    default: null,
    trim: true,
    maxlength: [500, 'File download path cannot exceed 500 characters']
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

transactionSchema.index({ transaction_id: 1 });
transactionSchema.index({ user_id: 1 });
transactionSchema.index({ Plan_id: 1 });
transactionSchema.index({ payment_method_id: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ Status: 1 });
transactionSchema.index({ business_Branch_id: 1 });

transactionSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let TransactionModel;
try {
  TransactionModel = mongoose.model('Transaction');
} catch (error) {
  transactionSchema.plugin(AutoIncrement, { inc_field: 'transaction_id', start_seq: 1 });
  TransactionModel = mongoose.model('Transaction', transactionSchema);
}

module.exports = TransactionModel;

