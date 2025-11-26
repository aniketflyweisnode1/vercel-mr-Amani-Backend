const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reportAnIssueSchema = new mongoose.Schema({
  ReportAnIssue_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  TypeIssue: {
    type: String,
    required: [true, 'Type issue is required'],
    trim: true,
    maxlength: [200, 'Type issue cannot exceed 200 characters']
  },
  Description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  ScreenShot: {
    type: String,
    trim: true,
    maxlength: [500, 'Screen shot URL cannot exceed 500 characters']
  },
  referenceissue: {
    type: String,
    unique: true,
    trim: true,
    maxlength: [50, 'Reference issue cannot exceed 50 characters']
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

reportAnIssueSchema.index({ ReportAnIssue_id: 1 });
reportAnIssueSchema.index({ Branch_id: 1 });
reportAnIssueSchema.index({ TypeIssue: 1 });
reportAnIssueSchema.index({ referenceissue: 1 });
reportAnIssueSchema.index({ Status: 1 });
reportAnIssueSchema.index({ created_by: 1 });

reportAnIssueSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reportAnIssueSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reportAnIssueSchema.plugin(AutoIncrement, { inc_field: 'ReportAnIssue_id', start_seq: 1 });

module.exports = mongoose.model('ReportAnIssue', reportAnIssueSchema);

