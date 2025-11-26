const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const planSchema = new mongoose.Schema({
  Plan_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [200, 'Plan name cannot exceed 200 characters']
  },
  FistfreeDays: {
    type: Number,
    default: 0,
    min: [0, 'First free days cannot be negative']
  },
  Price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  PlanDurectionDay: {
    type: Number,
    required: [true, 'Plan duration days is required'],
    min: [1, 'Plan duration must be at least 1 day']
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

planSchema.index({ Plan_id: 1 });
planSchema.index({ Status: 1 });

planSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

planSchema.plugin(AutoIncrement, { inc_field: 'Plan_id', start_seq: 1 });

module.exports = mongoose.model('Plan', planSchema);

