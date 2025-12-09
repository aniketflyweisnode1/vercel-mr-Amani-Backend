const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const deliveryPeriodEnum = ['Daily', 'Weekly', 'Monthly'];

const restaurantItemRequestSchema = new mongoose.Schema({
  Restaurant_item_Request_id: {
    type: Number,
    unique: true
  },
  item_id: {
    type: Number,
    ref: 'Restaurant_Items',
    required: [true, 'Item ID is required']
  },
  Supplier_id: {
    type: Number,
    ref: 'Supplier',
    required: [true, 'Supplier ID is required']
  },
  RequiredStock: {
    type: Number,
    required: [true, 'Required stock is required'],
    min: [0, 'Required stock cannot be negative']
  },
  Unit: {
    type: String,
    trim: true,
    maxlength: [50, 'Unit cannot exceed 50 characters']
  },
  Price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  DeliveryPeriod: {
    type: String,
    enum: deliveryPeriodEnum,
    default: 'Daily'
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

restaurantItemRequestSchema.index({ Restaurant_item_Request_id: 1 });
restaurantItemRequestSchema.index({ item_id: 1 });
restaurantItemRequestSchema.index({ Supplier_id: 1 });
restaurantItemRequestSchema.index({ Status: 1 });
restaurantItemRequestSchema.index({ DeliveryPeriod: 1 });

restaurantItemRequestSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantItemRequestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let RestaurantItemRequestModel;
try {
  RestaurantItemRequestModel = mongoose.model('Restaurant_item_Request');
} catch (error) {
  restaurantItemRequestSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_item_Request_id', start_seq: 1 });
  RestaurantItemRequestModel = mongoose.model('Restaurant_item_Request', restaurantItemRequestSchema);
}

module.exports = RestaurantItemRequestModel;
