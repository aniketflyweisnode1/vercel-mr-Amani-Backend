const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantItemsSchema = new mongoose.Schema({
  Restaurant_Items_id: {
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
  CurrentStock: {
    type: Number,
    default: 0,
    min: [0, 'Current stock cannot be negative']
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [50, 'Unit cannot exceed 50 characters']
  },
  minStock: {
    type: Number,
    default: 0,
    min: [0, 'Minimum stock cannot be negative']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  SupplierName: {
    type: String,
    trim: true,
    maxlength: [200, 'Supplier name cannot exceed 200 characters']
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

restaurantItemsSchema.index({ Restaurant_Items_id: 1 });
restaurantItemsSchema.index({ business_Branch_id: 1 });
restaurantItemsSchema.index({ Restaurant_item_Category_id: 1 });
restaurantItemsSchema.index({ Status: 1 });
restaurantItemsSchema.index({ SupplierName: 1 });

restaurantItemsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantItemsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantItemsSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Items_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Items', restaurantItemsSchema);


