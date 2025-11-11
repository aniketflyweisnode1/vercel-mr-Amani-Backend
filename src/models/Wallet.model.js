const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const walletSchema = new mongoose.Schema({
  wallet_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  Amount: {
    type: Number,
    default: 0,
    min: [0, 'Amount cannot be negative']
  },
  HoldAmount: {
    type: Number,
    default: 0,
    min: [0, 'Hold amount cannot be negative']
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
walletSchema.index({ wallet_id: 1 });
walletSchema.index({ user_id: 1 });
walletSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
walletSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for wallet_id
walletSchema.plugin(AutoIncrement, { inc_field: 'wallet_id', start_seq: 1 });

module.exports = mongoose.model('Wallet', walletSchema);

