const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const workingHourEntrySchema = new mongoose.Schema({
  Day: {
    type: String,
    trim: true,
    maxlength: [100, 'Day label cannot exceed 100 characters'],
    required: [true, 'Day is required']
  },
  Houre: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, { _id: false });

const scheduleEveryOneSchema = new mongoose.Schema({
  WorkForceManagement_Schedule_EveryOne_id: {
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
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  worckingHoure: {
    type: [workingHourEntrySchema],
    default: []
  },
  otherInfo_type: {
    type: String,
    trim: true,
    maxlength: [200, 'Other info type cannot exceed 200 characters']
  },
  Business: {
    type: String,
    trim: true,
    maxlength: [200, 'Business cannot exceed 200 characters']
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

scheduleEveryOneSchema.index({ WorkForceManagement_Schedule_EveryOne_id: 1 });
scheduleEveryOneSchema.index({ otherInfo_type: 1 });
scheduleEveryOneSchema.index({ Status: 1 });

scheduleEveryOneSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

scheduleEveryOneSchema.plugin(AutoIncrement, { inc_field: 'WorkForceManagement_Schedule_EveryOne_id', start_seq: 1 });

module.exports = mongoose.model('WorkForceManagement_Schedule_EveryOne', scheduleEveryOneSchema);



