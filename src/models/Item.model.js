const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemSchema = new mongoose.Schema({
  Item_id: {
    type: Number,
    unique: true
  },
  service_id: {
    type: Number,
    ref: 'Services',
    required: [true, 'Service ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  item_type_id: {
    type: Number,
    ref: 'Item_type',
    required: [true, 'Item type ID is required']
  },
  item_Category_id: {
    type: Number,
    ref: 'Item_Category',
    required: [true, 'Item category ID is required']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  Stock_count: {
    type: Number,
    default: 0,
    min: [0, 'Stock count cannot be negative']
  },
  item_price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Item price cannot be negative']
  },
  item_image: {
    type: String,
    trim: true,
    maxlength: [500, 'Item image URL cannot exceed 500 characters']
  },
  status: {
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

itemSchema.index({ Item_id: 1 });
itemSchema.index({ service_id: 1 });
itemSchema.index({ item_type_id: 1 });
itemSchema.index({ item_Category_id: 1 });
itemSchema.index({ business_Branch_id: 1 });
itemSchema.index({ name: 1 });
itemSchema.index({ status: 1 });

itemSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

itemSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

itemSchema.plugin(AutoIncrement, { inc_field: 'Item_id', start_seq: 1 });

let ItemModel;
try {
  ItemModel = mongoose.model('Item');
} catch (error) {
  ItemModel = mongoose.model('Item', itemSchema);
}

module.exports = ItemModel;

