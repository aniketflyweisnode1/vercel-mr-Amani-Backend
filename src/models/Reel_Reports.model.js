const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelReportsSchema = new mongoose.Schema({
  Reel_Reports_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  ReportBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Report by user ID is required']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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

reelReportsSchema.index({ Reel_Reports_id: 1 });
reelReportsSchema.index({ Real_Post_id: 1 });
reelReportsSchema.index({ ReportBy: 1 });
reelReportsSchema.index({ Status: 1 });

reelReportsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelReportsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reelReportsSchema.plugin(AutoIncrement, { inc_field: 'Reel_Reports_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Reports', reelReportsSchema);

