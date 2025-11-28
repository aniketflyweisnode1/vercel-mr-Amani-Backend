const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paymentMethodSchema = new mongoose.Schema({
  payment_method_id: {
    type: Number,
    unique: true
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true,
    maxlength: [100, 'Payment method cannot exceed 100 characters']
  },
  emoji: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
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

paymentMethodSchema.index({ payment_method_id: 1 });
paymentMethodSchema.index({ Status: 1 });

paymentMethodSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let PaymentMethodsModel;
try {
  PaymentMethodsModel = mongoose.model('PaymentMethods');
} catch (error) {
  paymentMethodSchema.plugin(AutoIncrement, { inc_field: 'payment_method_id', start_seq: 1 });
  PaymentMethodsModel = mongoose.model('PaymentMethods', paymentMethodSchema);
}

module.exports = PaymentMethodsModel;

