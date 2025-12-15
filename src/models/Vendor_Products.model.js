const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorProductsSchema = new mongoose.Schema({
  Vendor_Products_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    required: [true, 'User ID is required']
  },
  Products_image: {
    type: String,
    trim: true,
    maxlength: [500, 'Product image path cannot exceed 500 characters']
  },
  Title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  Category_id: {
    type: Number,
    ref: 'Vendor_Product_Category',
    required: [true, 'Category ID is required']
  },
  Subcategory_id: {
    type: Number,
    ref: 'Vendor_Product_SubCategory',
    default: null
  },
  Coupontype: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public',
    trim: true
  },
  brand: {
    type: Number,
    default: null
  },
  Color: {
    type: String,
    trim: true,
    maxlength: [50, 'Color cannot exceed 50 characters']
  },
  Waranty: {
    type: String,
    trim: true,
    maxlength: [200, 'Warranty cannot exceed 200 characters']
  },
  inStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  Avaliable: {
    type: Boolean,
    default: false
  },
  Size: {
    type: String,
    trim: true,
    maxlength: [100, 'Size cannot exceed 100 characters']
  },
  Material: {
    type: String,
    trim: true,
    maxlength: [200, 'Material cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  SelectCondition: {
    type: String,
    default: 'New',
    trim: true
  },
  type: {
    type: Number,
    default: null
  },
  features: {
    type: Number,
    default: null
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
    max: [100, 'Tax cannot exceed 100']
  },
  PriceFormat: {
    type: [String],
    default: []
  },
  PriceCurrency: {
    type: String,
    trim: true,
    maxlength: [10, 'Currency code cannot exceed 10 characters']
  },
  autoPriceReduction: {
    type: Boolean,
    default: false
  },
  autoPriceReductionTrue: {
    type: [{
      lowerPrice: { type: String, default: '' },
      MinimumPrice: { type: String, default: '' }
    }],
    default: []
  },
  BuyItNewSetting: {
    type: [{
      AllowOfferabouve: { type: String, default: '' },
      Quantity: { type: Number, default: 0 },
      ScheduleListingStartTime: { type: String, default: '' }
    }],
    default: []
  },
  DeliveryMethod: {
    type: [String],
    default: []
  },
  PackageDetails: {
    type: [String],
    default: []
  },
  DomesticShipping: {
    type: [String],
    default: []
  },
  whoPays: {
    type: [{
      BuyerPay: { type: String, default: '' },
      sellerPays: { type: String, default: '' }
    }],
    default: []
  },
  InternationalShipping: {
    type: Boolean,
    default: false
  },
  InternationalShippingDestination: {
    type: String,
    trim: true,
    maxlength: [200, 'International shipping destination cannot exceed 200 characters']
  },
  DeliveryDetails: {
    type: [{
      Loactied: { type: String, default: '' },
      HandilingTime: { type: String, default: '' },
      ReturnPolicy: { type: String, default: '' }
    }],
    default: []
  },
  Status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
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

// Pre-save middleware to update Avaliable based on inStock and updated_at timestamp
vendorProductsSchema.pre('save', function (next) {
  // Set Avaliable to true if inStock > 0, false otherwise
  this.Avaliable = this.inStock > 0;
  
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Index for better query performance
vendorProductsSchema.index({ Vendor_Products_id: 1 });
vendorProductsSchema.index({ user_id: 1 });
vendorProductsSchema.index({ Category_id: 1 });
vendorProductsSchema.index({ Subcategory_id: 1 });
vendorProductsSchema.index({ Coupontype: 1 });
vendorProductsSchema.index({ Status: 1 });
vendorProductsSchema.index({ Title: 1 });
vendorProductsSchema.index({ Avaliable: 1 });

// Auto-increment plugin for Vendor_Products_id
vendorProductsSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Products_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Products', vendorProductsSchema);

