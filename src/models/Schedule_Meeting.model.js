const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const scheduleMeetingSchema = new mongoose.Schema({
  Schedule_Meeting_id: {
    type: Number,
    unique: true
  },
  meetingDate: {
    type: Date,
    required: [true, 'Meeting date is required']
  },
  MeetingTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Meeting time cannot exceed 50 characters'],
    required: [true, 'Meeting time is required']
  },
  ContactPersonName: {
    type: String,
    trim: true,
    maxlength: [200, 'Contact person name cannot exceed 200 characters'],
    required: [true, 'Contact person name is required']
  },
  PhoneNo: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
    required: [true, 'Phone number is required']
  },
  MeetingDuration: {
    type: Number,
    min: [1, 'Meeting duration must be at least 1 minute'],
    integer: true
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

scheduleMeetingSchema.index({ Schedule_Meeting_id: 1 });
scheduleMeetingSchema.index({ meetingDate: 1 });
scheduleMeetingSchema.index({ Status: 1 });
scheduleMeetingSchema.index({ created_by: 1 });

scheduleMeetingSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

scheduleMeetingSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let ScheduleMeetingModel;
try {
  ScheduleMeetingModel = mongoose.model('Schedule_Meeting');
} catch (error) {
  scheduleMeetingSchema.plugin(AutoIncrement, { inc_field: 'Schedule_Meeting_id', start_seq: 1 });
  ScheduleMeetingModel = mongoose.model('Schedule_Meeting', scheduleMeetingSchema);
}

module.exports = ScheduleMeetingModel;

