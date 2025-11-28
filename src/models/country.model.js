const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const countrySchema = new mongoose.Schema({
  country_id: {
    type: Number,
    unique: true
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
    maxlength: [3, 'ISO code cannot exceed 3 characters']
  },
  code2: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [2, 'Code2 cannot exceed 2 characters']
  },
  code3: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [3, 'Code3 cannot exceed 3 characters']
  },
  phonecode: {
    type: String,
    trim: true,
    maxlength: [10, 'Phone code cannot exceed 10 characters']
  },
  capital: {
    type: String,
    trim: true,
    maxlength: [100, 'Capital cannot exceed 100 characters']
  },
  currency: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [3, 'Currency code cannot exceed 3 characters']
  },
  flag: {
    type: String,
    trim: true
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
  timezones: [{
    zoneName: {
      type: String,
      trim: true
    },
    gmtOffset: {
      type: Number
    },
    gmtOffsetName: {
      type: String,
      trim: true
    },
    abbreviation: {
      type: String,
      trim: true
    },
    tzName: {
      type: String,
      trim: true
    }
  }],
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
countrySchema.index({ country_id: 1 });
countrySchema.index({ name: 1 });
countrySchema.index({ isoCode: 1 });
countrySchema.index({ code2: 1 });
countrySchema.index({ code3: 1 });
countrySchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
countrySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for country_id - only apply if model doesn't exist
if (!mongoose.models.Country) {
  countrySchema.plugin(AutoIncrement, { inc_field: 'country_id', start_seq: 1 });
  module.exports = mongoose.model('Country', countrySchema);
} else {
  module.exports = mongoose.models.Country;
}

