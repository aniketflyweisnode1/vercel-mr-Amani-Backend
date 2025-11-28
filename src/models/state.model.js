const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const stateSchema = new mongoose.Schema({
  state_id: {
    type: Number,
    unique: true
  },
  country_id: {
    type: Number,
    ref: 'Country',
    required: [true, 'Country ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  isoCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'ISO code cannot exceed 10 characters']
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Code cannot exceed 10 characters']
  },
  countryCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [3, 'Country code cannot exceed 3 characters']
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
stateSchema.index({ state_id: 1 });
stateSchema.index({ country_id: 1 });
stateSchema.index({ name: 1 });
stateSchema.index({ isoCode: 1 });
stateSchema.index({ code: 1 });
stateSchema.index({ countryCode: 1 });
stateSchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
stateSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for state_id - only apply if model doesn't exist
if (!mongoose.models.State) {
  stateSchema.plugin(AutoIncrement, { inc_field: 'state_id', start_seq: 1 });
  module.exports = mongoose.model('State', stateSchema);
} else {
  module.exports = mongoose.models.State;
}

