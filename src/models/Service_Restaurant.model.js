const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const serviceRestaurantSchema = new mongoose.Schema({
  Service_Restaurant_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
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

serviceRestaurantSchema.index({ Service_Restaurant_id: 1 });
serviceRestaurantSchema.index({ business_Branch_id: 1 });
serviceRestaurantSchema.index({ name: 1 });
serviceRestaurantSchema.index({ Status: 1 });

serviceRestaurantSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

serviceRestaurantSchema.plugin(AutoIncrement, { inc_field: 'Service_Restaurant_id', start_seq: 1 });

module.exports = mongoose.model('Service_Restaurant', serviceRestaurantSchema);

