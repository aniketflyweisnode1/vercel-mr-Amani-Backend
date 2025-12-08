const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const printerSchema = new mongoose.Schema({
  Printer_id: {
    type: Number,
    unique: true
  },
  PrinterName: {
    type: String,
    required: [true, 'Printer name is required'],
    trim: true,
    maxlength: [200, 'Printer name cannot exceed 200 characters']
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Printer_type: {
    type: Number,
    ref: 'Printer_type',
    required: [true, 'Printer type is required']
  },
  IpAddress: {
    type: String,
    trim: true,
    maxlength: [50, 'IP address cannot exceed 50 characters']
  },
  Port: {
    type: String,
    trim: true,
    maxlength: [10, 'Port cannot exceed 10 characters']
  },
  onlineStatus: {
    type: Boolean,
    default: false
  },
  PaperStatus: {
    type: String,
    trim: true,
    maxlength: [100, 'Paper status cannot exceed 100 characters']
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

printerSchema.index({ Printer_id: 1 });
printerSchema.index({ Branch_id: 1 });
printerSchema.index({ Printer_type: 1 });
printerSchema.index({ Status: 1 });

printerSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

printerSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let PrinterModel;
try {
  PrinterModel = mongoose.model('Printer');
} catch (error) {
  printerSchema.plugin(AutoIncrement, { inc_field: 'Printer_id', start_seq: 1 });
  PrinterModel = mongoose.model('Printer', printerSchema);
}

module.exports = PrinterModel;
