const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const serviceChargesSchema = new mongoose.Schema({
  ServiceCharges_id: {
    type: Number,
    unique: true
  },
  ServiceCharges_type_id: {
    type: Number,
    ref: 'ServiceCharges_type',
    required: [true, 'Service charges type ID is required']
  },
  Service_Restaurant_id: {
    type: Number,
    ref: 'Service_Restaurant',
    required: [true, 'Service restaurant ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  charges: {
    type: Number,
    required: [true, 'Charges is required'],
    min: [0, 'Charges cannot be negative']
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

serviceChargesSchema.index({ ServiceCharges_id: 1 });
serviceChargesSchema.index({ ServiceCharges_type_id: 1 });
serviceChargesSchema.index({ Service_Restaurant_id: 1 });
serviceChargesSchema.index({ business_Branch_id: 1 });
serviceChargesSchema.index({ name: 1 });
serviceChargesSchema.index({ Status: 1 });

serviceChargesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

serviceChargesSchema.plugin(AutoIncrement, { inc_field: 'ServiceCharges_id', start_seq: 1 });

module.exports = mongoose.model('ServiceCharges', serviceChargesSchema);

