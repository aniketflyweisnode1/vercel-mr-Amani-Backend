const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const dasboardListSchema = new mongoose.Schema({
  DasboardList_id: {
    type: Number,
    unique: true
  },
  FoodYouMaylike: {
    type: [Number],
    ref: 'Vendor_Products',
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(id => Number.isInteger(id) && id > 0);
      },
      message: 'FoodYouMaylike must be an array of positive integers'
    }
  },
  GrabYourDeal: {
    type: [Number],
    ref: 'Vendor_Products',
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(id => Number.isInteger(id) && id > 0);
      },
      message: 'GrabYourDeal must be an array of positive integers'
    }
  },
  FeaturedProductForYou: {
    type: [Number],
    ref: 'Vendor_Products',
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(id => Number.isInteger(id) && id > 0);
      },
      message: 'FeaturedProductForYou must be an array of positive integers'
    }
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

// Index for better query performance
dasboardListSchema.index({ DasboardList_id: 1 });
dasboardListSchema.index({ Status: 1 });
dasboardListSchema.index({ created_by: 1 });

// Pre-save middleware to update updated_at timestamp
dasboardListSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for DasboardList_id
dasboardListSchema.plugin(AutoIncrement, { inc_field: 'DasboardList_id', start_seq: 1 });

module.exports = mongoose.model('DasboardList', dasboardListSchema);

