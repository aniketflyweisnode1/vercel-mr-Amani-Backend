const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteSettingsSchema = new mongoose.Schema({
  Restaurant_website_Settings_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Restaurant_website_id: {
    type: Number,
    ref: 'Restaurant_website_OurDomain',
    required: [true, 'Restaurant website ID is required']
  },
  pickup: {
    type: Boolean,
    default: false
  },
  CurbsidePickup: {
    type: Boolean,
    default: false
  },
  Delivery: {
    type: Boolean,
    default: false
  },
  HandIteToMe: {
    type: Boolean,
    default: false
  },
  LeaveitAtmyDoor: {
    type: Boolean,
    default: false
  },
  InHouseDelivery: {
    type: Boolean,
    default: false
  },
  UberDelivery: {
    type: Boolean,
    default: false
  },
  DeliveryType: {
    type: String,
    trim: true,
    maxlength: [100, 'Delivery type cannot exceed 100 characters']
  },
  EableFlatFee: {
    type: Boolean,
    default: false
  },
  MarketPlaxe_OrderForPickUp: {
    type: Boolean,
    default: false
  },
  MarketPlaxe_OrderForDeleivery: {
    type: Boolean,
    default: false
  },
  Payment_PayinStore: {
    type: Boolean,
    default: false
  },
  Payment_CreditCard: {
    type: Boolean,
    default: false
  },
  Payment_ApplePay: {
    type: Boolean,
    default: false
  },
  Payment_GooglePay: {
    type: Boolean,
    default: false
  },
  PaymentServiceStrip_AccountNo: {
    type: String,
    trim: true,
    maxlength: [150, 'Stripe Account number cannot exceed 150 characters']
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

restaurantWebsiteSettingsSchema.index({ Restaurant_website_Settings_id: 1 });
restaurantWebsiteSettingsSchema.index({ business_Branch_id: 1 });
restaurantWebsiteSettingsSchema.index({ Restaurant_website_id: 1 });
restaurantWebsiteSettingsSchema.index({ Status: 1 });

restaurantWebsiteSettingsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteSettingsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteSettingsSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_Settings_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_Settings', restaurantWebsiteSettingsSchema);


