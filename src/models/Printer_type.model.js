const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const printerTypeSchema = new mongoose.Schema({
  Printer_type_id: {
    type: Number,
    unique: true
  },
  Printer_type: {
    type: String,
    required: [true, 'Printer type is required'],
    trim: true,
    maxlength: [200, 'Printer type cannot exceed 200 characters']
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

printerTypeSchema.index({ Printer_type_id: 1 });
printerTypeSchema.index({ Status: 1 });

printerTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

printerTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let PrinterTypeModel;
try {
  PrinterTypeModel = mongoose.model('Printer_type');
} catch (error) {
  printerTypeSchema.plugin(AutoIncrement, { inc_field: 'Printer_type_id', start_seq: 1 });
  PrinterTypeModel = mongoose.model('Printer_type', printerTypeSchema);
}

module.exports = PrinterTypeModel;
