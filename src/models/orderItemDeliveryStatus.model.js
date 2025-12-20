const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderItemDeliveryStatusSchema = new mongoose.Schema({
  orderItemDeliveryStatus_id: {
    type: Number,
    unique: true
  },
  order_id: {
    type: Number,
    ref: 'Order_Now',
    required: [true, 'Order ID is required']
  },
  Item_id: {
    type: Number,
    ref: 'Restaurant_Items',
    required: [true, 'Item ID is required']
  },
  DeliveryStatus: {
    type: String,
    enum: ['Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed',
    trim: true
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, 'Location cannot exceed 500 characters']
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
orderItemDeliveryStatusSchema.index({ orderItemDeliveryStatus_id: 1 });
orderItemDeliveryStatusSchema.index({ order_id: 1 });
orderItemDeliveryStatusSchema.index({ Item_id: 1 });
orderItemDeliveryStatusSchema.index({ DeliveryStatus: 1 });
orderItemDeliveryStatusSchema.index({ Status: 1 });
orderItemDeliveryStatusSchema.index({ created_by: 1 });

// Pre-save middleware to update updated_at timestamp
orderItemDeliveryStatusSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Pre-update middleware
orderItemDeliveryStatusSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Auto-increment plugin for orderItemDeliveryStatus_id
let OrderItemDeliveryStatusModel;
try {
  OrderItemDeliveryStatusModel = mongoose.model('orderItemDeliveryStatus');
} catch (error) {
  orderItemDeliveryStatusSchema.plugin(AutoIncrement, { inc_field: 'orderItemDeliveryStatus_id', start_seq: 1 });
  OrderItemDeliveryStatusModel = mongoose.model('orderItemDeliveryStatus', orderItemDeliveryStatusSchema);
}

module.exports = OrderItemDeliveryStatusModel;

