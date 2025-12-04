const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productSchema = new mongoose.Schema({
  Item_id: {
    type: Number,
    ref: 'Restaurant_Items',
    required: [true, 'Item ID is required']
  },
  Size: {
    type: Number,
    default: 1,
    min: [0, 'Size cannot be negative']
  },
  Quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  Price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  DiscountPrice: {
    type: Number,
    default: 0,
    min: [0, 'Discount price cannot be negative']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  Cart_id: {
    type: Number,
    unique: true
  },
  Product: {
    type: [productSchema],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Product array must contain at least one item'
    }
  },
  applyDiscount_id: {
    type: Number,
    ref: 'Discounts',
    default: null
  },
  service_id: {
    type: Number,
    ref: 'Services',
    default: null
  },
  User_Id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
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

// Index for better query performance
cartSchema.index({ Cart_id: 1 });
cartSchema.index({ User_Id: 1 });
cartSchema.index({ applyDiscount_id: 1 });
cartSchema.index({ service_id: 1 });
cartSchema.index({ Status: 1 });
cartSchema.index({ created_at: 1 });

// Pre-save middleware to update updated_at timestamp
cartSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Cart_id
let CartModel;
try {
  CartModel = mongoose.model('Cart');
} catch (error) {
  cartSchema.plugin(AutoIncrement, { inc_field: 'Cart_id', start_seq: 1 });
  CartModel = mongoose.model('Cart', cartSchema);
}

module.exports = CartModel;

