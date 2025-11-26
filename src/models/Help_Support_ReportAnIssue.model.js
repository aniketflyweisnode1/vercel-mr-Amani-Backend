const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpSupportReportAnIssueSchema = new mongoose.Schema({
  Help_Support_ReportAnIssue_id: {
    type: Number,
    unique: true
  },
  Branch_Id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Issue_type_id: {
    type: Number,
    ref: 'Issue_Type',
    required: [true, 'Issue type ID is required']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  attachfile: {
    type: String,
    trim: true,
    maxlength: [500, 'Attach file path cannot exceed 500 characters']
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

helpSupportReportAnIssueSchema.index({ Help_Support_ReportAnIssue_id: 1 });
helpSupportReportAnIssueSchema.index({ Branch_Id: 1 });
helpSupportReportAnIssueSchema.index({ Issue_type_id: 1 });
helpSupportReportAnIssueSchema.index({ Status: 1 });

helpSupportReportAnIssueSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpSupportReportAnIssueSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

helpSupportReportAnIssueSchema.plugin(AutoIncrement, { inc_field: 'Help_Support_ReportAnIssue_id', start_seq: 1 });

module.exports = mongoose.model('Help_Support_ReportAnIssue', helpSupportReportAnIssueSchema);

