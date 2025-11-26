const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantAlertsTypeSchema = new mongoose.Schema({
  Restaurant_Alerts_type_id: {
    type: Number,
    unique: true
  },
  TypeName: {
    type: String,
    required: [true, 'Type name is required'],
    trim: true,
    minlength: [2, 'Type name must be at least 2 characters'],
    maxlength: [150, 'Type name cannot exceed 150 characters']
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

restaurantAlertsTypeSchema.index({ Restaurant_Alerts_type_id: 1 });
restaurantAlertsTypeSchema.index({ TypeName: 1 });
restaurantAlertsTypeSchema.index({ Status: 1 });

restaurantAlertsTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantAlertsTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantAlertsTypeSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Alerts_type_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Alerts_type', restaurantAlertsTypeSchema);


