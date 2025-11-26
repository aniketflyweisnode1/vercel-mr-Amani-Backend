const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantPlanSchema = new mongoose.Schema({
  Restaurant_Plan_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [200, 'Plan name cannot exceed 200 characters']
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required'],
    min: [0, 'Fee cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1']
  },
  Plan_facility: [{
    line: {
      type: String,
      trim: true,
      maxlength: [500, 'Facility line cannot exceed 500 characters']
    },
    apply: {
      type: Boolean,
      default: false
    }
  }],
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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

restaurantPlanSchema.index({ Restaurant_Plan_id: 1 });
restaurantPlanSchema.index({ business_Branch_id: 1 });
restaurantPlanSchema.index({ name: 1 });
restaurantPlanSchema.index({ Status: 1 });

restaurantPlanSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantPlanSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantPlanSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Plan_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Plan', restaurantPlanSchema);

