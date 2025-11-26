const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const closingDaysSchema = new mongoose.Schema({
  closing_days_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  dayCount: {
    type: Number,
    required: [true, 'Day count is required'],
    min: [0, 'Day count cannot be negative'],
    integer: true
  },
  dateFrom: {
    type: Date,
    required: [true, 'Date from is required']
  },
  datedTo: {
    type: Date,
    required: [true, 'Date to is required']
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

closingDaysSchema.index({ closing_days_id: 1 });
closingDaysSchema.index({ Branch_id: 1 });
closingDaysSchema.index({ Status: 1 });
closingDaysSchema.index({ created_by: 1 });
closingDaysSchema.index({ title: 1 });
closingDaysSchema.index({ dateFrom: 1 });
closingDaysSchema.index({ datedTo: 1 });

closingDaysSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

closingDaysSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

closingDaysSchema.plugin(AutoIncrement, { inc_field: 'closing_days_id', start_seq: 1 });

module.exports = mongoose.model('closing_days', closingDaysSchema);

