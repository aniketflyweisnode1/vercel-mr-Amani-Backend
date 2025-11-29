const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const referralSchema = new mongoose.Schema({
  Referral_id: {
    type: Number,
    unique: true
  },
  Referral_To: {
    type: Number,
    ref: 'User',
    required: [true, 'Referral To (User ID) is required']
  },
  Referral_from: {
    type: Number,
    ref: 'User',
    required: [true, 'Referral From (User ID) is required']
  },
  Earning: {
    type: Number,
    ref: 'Transaction',
    default: null
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
referralSchema.index({ Referral_id: 1 });
referralSchema.index({ Referral_To: 1 });
referralSchema.index({ Referral_from: 1 });
referralSchema.index({ Earning: 1 });
referralSchema.index({ Status: 1 });
referralSchema.index({ created_at: 1 });

// Pre-save middleware to update updated_at timestamp
referralSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let ReferralModel;
try {
  ReferralModel = mongoose.model('Referral');
} catch (error) {
  referralSchema.plugin(AutoIncrement, { inc_field: 'Referral_id', start_seq: 1 });
  ReferralModel = mongoose.model('Referral', referralSchema);
}

module.exports = ReferralModel;

