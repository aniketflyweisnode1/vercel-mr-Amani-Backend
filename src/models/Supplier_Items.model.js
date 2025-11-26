const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supplierItemsSchema = new mongoose.Schema({
  Supplier_Items_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  Restaurant_item_Category_id: {
    type: Number,
    ref: 'Restaurant_item_Category',
    required: [true, 'Restaurant item category ID is required']
  },
  ItemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [150, 'Item name cannot exceed 150 characters']
  },
  Quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [50, 'Unit cannot exceed 50 characters']
  },
  MinThreshold: {
    type: Number,
    default: 0,
    min: [0, 'Minimum threshold cannot be negative']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  requestStatus: {
    type: String,
    enum: ['Pending', 'Process', 'Success'],
    default: 'Pending'
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

supplierItemsSchema.index({ Supplier_Items_id: 1 });
supplierItemsSchema.index({ business_Branch_id: 1 });
supplierItemsSchema.index({ Restaurant_item_Category_id: 1 });
supplierItemsSchema.index({ ItemName: 1 });
supplierItemsSchema.index({ Status: 1 });
supplierItemsSchema.index({ requestStatus: 1 });

supplierItemsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

supplierItemsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

supplierItemsSchema.plugin(AutoIncrement, { inc_field: 'Supplier_Items_id', start_seq: 1 });

module.exports = mongoose.model('Supplier_Items', supplierItemsSchema);


