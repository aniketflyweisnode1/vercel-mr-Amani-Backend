const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const printerOrdersSchema = new mongoose.Schema({
  Printer_Orders_id: {
    type: Number,
    unique: true
  },
  Printer_id: {
    type: Number,
    ref: 'Printer',
    required: [true, 'Printer ID is required']
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Process', 'Done'],
    default: 'Pending',
    required: [true, 'Order status is required']
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

printerOrdersSchema.index({ Printer_Orders_id: 1 });
printerOrdersSchema.index({ Printer_id: 1 });
printerOrdersSchema.index({ Branch_id: 1 });
printerOrdersSchema.index({ orderStatus: 1 });
printerOrdersSchema.index({ Status: 1 });

printerOrdersSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

printerOrdersSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let PrinterOrdersModel;
try {
  PrinterOrdersModel = mongoose.model('Printer_Orders');
} catch (error) {
  printerOrdersSchema.plugin(AutoIncrement, { inc_field: 'Printer_Orders_id', start_seq: 1 });
  PrinterOrdersModel = mongoose.model('Printer_Orders', printerOrdersSchema);
}

module.exports = PrinterOrdersModel;
