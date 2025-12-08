const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const printerIssuesSchema = new mongoose.Schema({
  Printer_Issues_id: {
    type: Number,
    unique: true
  },
  Printer_id: {
    type: Number,
    ref: 'Printer',
    required: [true, 'Printer ID is required']
  },
  Printer_Issues: {
    type: String,
    required: [true, 'Printer issues description is required'],
    trim: true,
    maxlength: [500, 'Printer issues cannot exceed 500 characters']
  },
  solveStatus: {
    type: Boolean,
    default: false
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

printerIssuesSchema.index({ Printer_Issues_id: 1 });
printerIssuesSchema.index({ Printer_id: 1 });
printerIssuesSchema.index({ Status: 1 });
printerIssuesSchema.index({ solveStatus: 1 });

printerIssuesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

printerIssuesSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let PrinterIssuesModel;
try {
  PrinterIssuesModel = mongoose.model('Printer_Issues');
} catch (error) {
  printerIssuesSchema.plugin(AutoIncrement, { inc_field: 'Printer_Issues_id', start_seq: 1 });
  PrinterIssuesModel = mongoose.model('Printer_Issues', printerIssuesSchema);
}

module.exports = PrinterIssuesModel;
