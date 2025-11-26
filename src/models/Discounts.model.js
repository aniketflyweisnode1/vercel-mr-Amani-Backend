const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const discountsSchema = new mongoose.Schema({
  Discounts_id: {
    type: Number,
    unique: true
  },
  Discounts_type_id: {
    type: Number,
    ref: 'Discounts_type',
    required: [true, 'Discount type ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  pricefix: {
    type: Number,
    required: [true, 'Fixed price is required'],
    min: [0, 'Fixed price cannot be negative']
  },
  pricePresentes: {
    type: Number,
    required: [true, 'Percentage price is required'],
    min: [0, 'Percentage price cannot be negative'],
    max: [100, 'Percentage price cannot exceed 100']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
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

discountsSchema.index({ Discounts_id: 1 });
discountsSchema.index({ Discounts_type_id: 1 });
discountsSchema.index({ business_Branch_id: 1 });
discountsSchema.index({ name: 1 });
discountsSchema.index({ Status: 1 });

discountsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

discountsSchema.plugin(AutoIncrement, { inc_field: 'Discounts_id', start_seq: 1 });

module.exports = mongoose.model('Discounts', discountsSchema);

