const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supplierSchema = new mongoose.Schema({
  Supplier_id: {
    type: Number,
    unique: true
  },
  Name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email cannot exceed 200 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  Mobile: {
    type: String,
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  Address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
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

supplierSchema.index({ Supplier_id: 1 });
supplierSchema.index({ Status: 1 });
supplierSchema.index({ Email: 1 });
supplierSchema.index({ Name: 1 });

supplierSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

supplierSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let SupplierModel;
try {
  SupplierModel = mongoose.model('Supplier');
} catch (error) {
  supplierSchema.plugin(AutoIncrement, { inc_field: 'Supplier_id', start_seq: 1 });
  SupplierModel = mongoose.model('Supplier', supplierSchema);
}

module.exports = SupplierModel;
