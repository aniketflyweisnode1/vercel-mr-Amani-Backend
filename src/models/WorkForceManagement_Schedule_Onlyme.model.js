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

const scheduleOnlyMeSchema = new mongoose.Schema({
  WorkForceManagement_Schedule_Onlyme_id: {
    type: Number,
    unique: true
  },
  Employee_id: {
    type: Number,
    ref: 'WorkForceManagement_Employee',
    required: [true, 'Employee ID is required']
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

scheduleOnlyMeSchema.index({ WorkForceManagement_Schedule_Onlyme_id: 1 });
scheduleOnlyMeSchema.index({ Employee_id: 1 });
scheduleOnlyMeSchema.index({ otherInfo_type: 1 });
scheduleOnlyMeSchema.index({ Status: 1 });

scheduleOnlyMeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

scheduleOnlyMeSchema.plugin(AutoIncrement, { inc_field: 'WorkForceManagement_Schedule_Onlyme_id', start_seq: 1 });

module.exports = mongoose.model('WorkForceManagement_Schedule_Onlyme', scheduleOnlyMeSchema);



