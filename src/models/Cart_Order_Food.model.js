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

const cartOrderFoodSchema = new mongoose.Schema({
  Cart_Order_Food_id: {
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
cartOrderFoodSchema.index({ Cart_Order_Food_id: 1 });
cartOrderFoodSchema.index({ User_Id: 1 });
cartOrderFoodSchema.index({ applyDiscount_id: 1 });
cartOrderFoodSchema.index({ Status: 1 });
cartOrderFoodSchema.index({ created_at: 1 });

// Pre-save middleware to update updated_at timestamp
cartOrderFoodSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Cart_Order_Food_id
let CartOrderFoodModel;
try {
  CartOrderFoodModel = mongoose.model('Cart_Order_Food');
} catch (error) {
  cartOrderFoodSchema.plugin(AutoIncrement, { inc_field: 'Cart_Order_Food_id', start_seq: 1 });
  CartOrderFoodModel = mongoose.model('Cart_Order_Food', cartOrderFoodSchema);
}

module.exports = CartOrderFoodModel;

