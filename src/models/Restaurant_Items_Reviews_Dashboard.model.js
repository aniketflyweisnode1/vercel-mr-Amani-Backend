const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewsDashboardSchema = new mongoose.Schema({
  Restaurant_Items_Reviews_Dashboard_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  OverallRating: {
    type: Number,
    default: 0,
    min: [0, 'Overall rating cannot be negative'],
    max: [5, 'Overall rating cannot exceed 5']
  },
  ExcellentCount: {
    type: Number,
    default: 0,
    min: [0, 'Excellent count cannot be negative']
  },
  GoodCount: {
    type: Number,
    default: 0,
    min: [0, 'Good count cannot be negative']
  },
  AverageCount: {
    type: Number,
    default: 0,
    min: [0, 'Average count cannot be negative']
  },
  PoorCount: {
    type: Number,
    default: 0,
    min: [0, 'Poor count cannot be negative']
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

reviewsDashboardSchema.index({ Restaurant_Items_Reviews_Dashboard_id: 1 });
reviewsDashboardSchema.index({ business_Branch_id: 1 });
reviewsDashboardSchema.index({ Status: 1 });

reviewsDashboardSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reviewsDashboardSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reviewsDashboardSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Items_Reviews_Dashboard_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Items_Reviews_Dashboard', reviewsDashboardSchema);


