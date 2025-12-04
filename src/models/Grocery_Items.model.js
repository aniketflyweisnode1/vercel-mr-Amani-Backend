const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const groceryItemsSchema = new mongoose.Schema({
  Grocery_Items_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  Grocery_Categories_id: {
    type: Number,
    ref: 'Grocery_Categories',
    required: [true, 'Grocery Categories ID is required']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  service_id: {
    type: Number,
    ref: 'Services',
    default: null
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  DeliveryTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Delivery time cannot exceed 50 characters']
  },
  item_image: {
    type: String,
    trim: true,
    maxlength: [500, 'Item image URL cannot exceed 500 characters']
  },
  Grocery_Categories_type_id: {
    type: Number,
    ref: 'Grocery_Categories_type',
    default: null
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

groceryItemsSchema.index({ Grocery_Items_id: 1 });
groceryItemsSchema.index({ business_Branch_id: 1 });
groceryItemsSchema.index({ Grocery_Categories_id: 1 });
groceryItemsSchema.index({ service_id: 1 });
groceryItemsSchema.index({ Grocery_Categories_type_id: 1 });
groceryItemsSchema.index({ Status: 1 });
groceryItemsSchema.index({ SupplierName: 1 });
groceryItemsSchema.index({ name: 1 });

groceryItemsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

groceryItemsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let GroceryItemsModel;
try {
  GroceryItemsModel = mongoose.model('Grocery_Items');
} catch (error) {
  groceryItemsSchema.plugin(AutoIncrement, { inc_field: 'Grocery_Items_id', start_seq: 1 });
  GroceryItemsModel = mongoose.model('Grocery_Items', groceryItemsSchema);
}

module.exports = GroceryItemsModel;

