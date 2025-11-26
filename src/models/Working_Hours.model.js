const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const workingHoursSchema = new mongoose.Schema({
  Working_Hours_id: {
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
  Days: {
    type: [String],
    required: [true, 'Days array is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(day => typeof day === 'string' && day.trim().length > 0);
      },
      message: 'Days must be a non-empty array of strings'
    }
  },
  time_from: {
    type: String,
    required: [true, 'Time from is required'],
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time from must be in HH:MM format (24-hour)']
  },
  time_to: {
    type: String,
    required: [true, 'Time to is required'],
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time to must be in HH:MM format (24-hour)']
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

workingHoursSchema.index({ Working_Hours_id: 1 });
workingHoursSchema.index({ Branch_id: 1 });
workingHoursSchema.index({ Status: 1 });
workingHoursSchema.index({ created_by: 1 });
workingHoursSchema.index({ title: 1 });

workingHoursSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

workingHoursSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

workingHoursSchema.plugin(AutoIncrement, { inc_field: 'Working_Hours_id', start_seq: 1 });

module.exports = mongoose.model('Working_Hours', workingHoursSchema);

