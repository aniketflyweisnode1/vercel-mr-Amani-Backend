const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantAlertsSchema = new mongoose.Schema({
  Restaurant_Alerts_id: {
    type: Number,
    unique: true
  },
  Restaurant_Alerts_type_id: {
    type: Number,
    ref: 'Restaurant_Alerts_type',
    required: [true, 'Restaurant alert type ID is required']
  },
  Alerts: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Alert title cannot exceed 200 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [150, 'Model name cannot exceed 150 characters']
  },
  id: {
    type: Number,
    default: null
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  versionKey: false,
  id: false
});

restaurantAlertsSchema.index({ Restaurant_Alerts_id: 1 });
restaurantAlertsSchema.index({ Restaurant_Alerts_type_id: 1 });
restaurantAlertsSchema.index({ model: 1 });
restaurantAlertsSchema.index({ id: 1 });
restaurantAlertsSchema.index({ Status: 1 });

restaurantAlertsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantAlertsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantAlertsSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Alerts_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Alerts', restaurantAlertsSchema);


