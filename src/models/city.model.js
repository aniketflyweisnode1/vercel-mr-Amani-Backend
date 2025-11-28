const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const citySchema = new mongoose.Schema({
  city_id: {
    type: Number,
    unique: true
  },
  state_id: {
    type: Number,
    ref: 'State',
    required: [true, 'State ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  stateCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'State code cannot exceed 10 characters']
  },
  countryCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [3, 'Country code cannot exceed 3 characters']
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  },
  status: {
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

// Index for better query performance
citySchema.index({ city_id: 1 });
citySchema.index({ state_id: 1 });
citySchema.index({ name: 1 });
citySchema.index({ stateCode: 1 });
citySchema.index({ countryCode: 1 });
citySchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
citySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for city_id - only apply if model doesn't exist
if (!mongoose.models.City) {
  citySchema.plugin(AutoIncrement, { inc_field: 'city_id', start_seq: 1 });
  module.exports = mongoose.model('City', citySchema);
} else {
  module.exports = mongoose.models.City;
}

