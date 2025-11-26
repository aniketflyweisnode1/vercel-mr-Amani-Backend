const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const subscriptionSchema = new mongoose.Schema({
  subscription_id: {
    type: Number,
    unique: true
  },
  Plan_id: {
    type: Number,
    ref: 'Plan',
    required: [true, 'Plan ID is required']
  },
  planStatus: {
    type: String,
    trim: true,
    maxlength: [50, 'Plan status cannot exceed 50 characters']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  transaction_id: {
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

subscriptionSchema.index({ subscription_id: 1 });
subscriptionSchema.index({ Plan_id: 1 });
subscriptionSchema.index({ user_id: 1 });
subscriptionSchema.index({ transaction_id: 1 });
subscriptionSchema.index({ Status: 1 });

subscriptionSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

subscriptionSchema.plugin(AutoIncrement, { inc_field: 'subscription_id', start_seq: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

