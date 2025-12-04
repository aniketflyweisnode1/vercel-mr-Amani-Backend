const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const deliverySchema = new mongoose.Schema({
  Delivery_id: {
    type: Number,
    unique: true
  },
  order_id: {
    type: Number,
    ref: 'Order_Now',
    required: [true, 'Order ID is required']
  },
  DeliveryDay: {
    type: Date,
    required: [true, 'Delivery day is required']
  },
  DeliveryLastTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Delivery last time cannot exceed 50 characters']
  },
  ReceivedPersonName: {
    type: String,
    trim: true,
    maxlength: [200, 'Received person name cannot exceed 200 characters']
  },
  DliveryStatus: {
    type: String,
    enum: ['Order Placed', 'Order Confirmed', 'Order Need to be Packed', 'Order Shipped', 'Out for Delivery', 'Delivered'],
    default: 'Order Placed',
    trim: true
  },
  DliveryPersonName: {
    type: String,
    trim: true,
    maxlength: [200, 'Delivery person name cannot exceed 200 characters']
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
deliverySchema.index({ Delivery_id: 1 });
deliverySchema.index({ order_id: 1 });
deliverySchema.index({ Status: 1 });
deliverySchema.index({ created_at: 1 });
deliverySchema.index({ DeliveryDay: 1 });

// Pre-save middleware to update updated_at timestamp
deliverySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Pre-update middleware to update updated_at timestamp
deliverySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

// Auto-increment plugin for Delivery_id
let DeliveryModel;
try {
  DeliveryModel = mongoose.model('Delivery');
} catch (error) {
  deliverySchema.plugin(AutoIncrement, { inc_field: 'Delivery_id', start_seq: 1 });
  DeliveryModel = mongoose.model('Delivery', deliverySchema);
}

module.exports = DeliveryModel;

