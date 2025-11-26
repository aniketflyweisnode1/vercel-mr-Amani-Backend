const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminPlanSubscriptionSchema = new mongoose.Schema({
  Admin_Plan_Subscripiton_id: {
    type: Number,
    unique: true
  },
  Admin_Plan_id: {
    type: Number,
    ref: 'Admin_Plan',
    required: [true, 'Admin plan ID is required']
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

adminPlanSubscriptionSchema.index({ Admin_Plan_Subscripiton_id: 1 });
adminPlanSubscriptionSchema.index({ Admin_Plan_id: 1 });
adminPlanSubscriptionSchema.index({ Subscribe_By: 1 });
adminPlanSubscriptionSchema.index({ PaymentStatus: 1 });
adminPlanSubscriptionSchema.index({ Status: 1 });
adminPlanSubscriptionSchema.index({ PlanExpiry_date: 1 });

adminPlanSubscriptionSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

adminPlanSubscriptionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

adminPlanSubscriptionSchema.plugin(AutoIncrement, { inc_field: 'Admin_Plan_Subscripiton_id', start_seq: 1 });

module.exports = mongoose.model('Admin_Plan_Subscripiton', adminPlanSubscriptionSchema);

