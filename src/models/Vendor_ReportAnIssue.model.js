const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorReportAnIssueSchema = new mongoose.Schema({
  Vendor_ReportAnIssue_id: {
    type: Number,
    unique: true
  },
  Vendor_Store_id: {
    type: Number,
    ref: 'Vendor_Store',
    required: [true, 'Vendor store ID is required']
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

vendorReportAnIssueSchema.index({ Vendor_ReportAnIssue_id: 1 });
vendorReportAnIssueSchema.index({ Vendor_Store_id: 1 });
vendorReportAnIssueSchema.index({ TypeIssue: 1 });
vendorReportAnIssueSchema.index({ referenceissue: 1 });
vendorReportAnIssueSchema.index({ Status: 1 });
vendorReportAnIssueSchema.index({ created_by: 1 });

vendorReportAnIssueSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorReportAnIssueSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorReportAnIssueSchema.plugin(AutoIncrement, { inc_field: 'Vendor_ReportAnIssue_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_ReportAnIssue', vendorReportAnIssueSchema);


