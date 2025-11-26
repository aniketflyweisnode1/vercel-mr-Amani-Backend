const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantPlanSubscriptionSchema = new mongoose.Schema({
  Restaurant_Plan_Subscripiton_id: {
    type: Number,
    unique: true
  },
  Restaurant_Plan_id: {
    type: Number,
    ref: 'Restaurant_Plan',
    required: [true, 'Restaurant plan ID is required']
  },
  Subscribe_By: {
    type: Number,
    ref: 'User',
    required: [true, 'Subscribe by user ID is required']
  },
  PlanExpiry_date: {
    type: Date,
    required: [true, 'Plan expiry date is required']
  },
  PaymentStatus: {
    type: String,
    enum: ['Pending', 'failed', 'success'],
    default: 'Pending'
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

restaurantPlanSubscriptionSchema.index({ Restaurant_Plan_Subscripiton_id: 1 });
restaurantPlanSubscriptionSchema.index({ Restaurant_Plan_id: 1 });
restaurantPlanSubscriptionSchema.index({ Subscribe_By: 1 });
restaurantPlanSubscriptionSchema.index({ PaymentStatus: 1 });
restaurantPlanSubscriptionSchema.index({ Status: 1 });
restaurantPlanSubscriptionSchema.index({ PlanExpiry_date: 1 });

restaurantPlanSubscriptionSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantPlanSubscriptionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantPlanSubscriptionSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Plan_Subscripiton_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Plan_Subscripiton', restaurantPlanSubscriptionSchema);

