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

const orderNowSchema = new mongoose.Schema({
  Order_Now_id: {
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
  Order: {
    type: String,
    enum: ['Picup', 'Delivery'],
    default: null,
    trim: true
  },
  payment_method_id: {
    type: Number,
    ref: 'PaymentMethods',
    required: [true, 'Payment method ID is required']
  },
  paymentStatus: {
    type: String,
    trim: true,
    maxlength: [100, 'Payment status cannot exceed 100 characters']
  },
  Delivery_address_id: {
    type: Number,
    ref: 'User_Address',
    default: null
  },
  Trangection_Id: {
    type: Number,
    ref: 'transaction',
    default: null
  },
  OrderStatus: {
    type: String,
    enum: ['Pending', 'Preparing', 'Confirmed', 'Out for Delivery', 'Cancelled', 'Un-Delivered', 'Placed', 'Return'],
    default: 'Pending',
    trim: true
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
orderNowSchema.index({ Order_Now_id: 1 });
orderNowSchema.index({ User_Id: 1 });
orderNowSchema.index({ applyDiscount_id: 1 });
orderNowSchema.index({ service_id: 1 });
orderNowSchema.index({ payment_method_id: 1 });
orderNowSchema.index({ Delivery_address_id: 1 });
orderNowSchema.index({ Trangection_Id: 1 });
orderNowSchema.index({ OrderStatus: 1 });
orderNowSchema.index({ Status: 1 });
orderNowSchema.index({ created_at: 1 });
orderNowSchema.index({ Order: 1 });

// Pre-save middleware to update updated_at timestamp
orderNowSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Order_Now_id
let OrderNowModel;
try {
  OrderNowModel = mongoose.model('Order_Now');
} catch (error) {
  orderNowSchema.plugin(AutoIncrement, { inc_field: 'Order_Now_id', start_seq: 1 });
  OrderNowModel = mongoose.model('Order_Now', orderNowSchema);
}

module.exports = OrderNowModel;

