const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Service schema for OrderMethod
const serviceSchema = new mongoose.Schema({
  ReceiveOnEmail: {
    type: Boolean,
    default: false
  },
  ReceiveOnSms: {
    type: Boolean,
    default: false
  },
  ReceiveOnNotification: {
    type: Boolean,
    default: false
  },
  ReceiveOnText: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// OrderMethod schema
const orderMethodSchema = new mongoose.Schema({
  MobileApp: {
    type: Boolean,
    default: false
  },
  Service: {
    type: [serviceSchema],
    default: []
  },
  Tablet: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const vendorStoreSchema = new mongoose.Schema({
  Vendor_Store_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  StoreName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [200, 'Store name cannot exceed 200 characters']
  },
  StoreAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Store address cannot exceed 500 characters']
  },
  EmailAddress: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    maxlength: [200, 'Email address cannot exceed 200 characters']
  },
  Country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  State: {
    type: String,
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  City: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  LocationName: {
    type: String,
    trim: true,
    maxlength: [200, 'Location name cannot exceed 200 characters']
  },
  StreetNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Street number cannot exceed 50 characters']
  },
  StreetName: {
    type: String,
    trim: true,
    maxlength: [200, 'Street name cannot exceed 200 characters']
  },
  ZipCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  StoreNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Store number cannot exceed 50 characters']
  },
  StartFreeTrail: {
    type: Boolean,
    default: true
  },
  StartFreeTraillDate: {
    type: Date
  },
  StoreLogo: {
    type: String,
    trim: true,
    maxlength: [500, 'Store logo path cannot exceed 500 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  mobileno: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  KYC_RecentUtilityBill: {
    type: String,
    trim: true,
    maxlength: [500, 'KYC Recent Utility Bill path cannot exceed 500 characters']
  },
  KycDrivingLicence: {
    type: String,
    trim: true,
    maxlength: [500, 'KYC Driving Licence path cannot exceed 500 characters']
  },
  KYC_BusinessLicenceNo: {
    type: String,
    trim: true,
    maxlength: [100, 'KYC Business Licence Number cannot exceed 100 characters']
  },
  KYC_EINNo: {
    type: String,
    trim: true,
    maxlength: [100, 'KYC EIN Number cannot exceed 100 characters']
  },
  OrderMethod: {
    type: orderMethodSchema,
    default: {
      MobileApp: false,
      Service: [],
      Tablet: false
    }
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
vendorStoreSchema.index({ Vendor_Store_id: 1 });
vendorStoreSchema.index({ user_id: 1 });
vendorStoreSchema.index({ Status: 1 });
vendorStoreSchema.index({ StoreName: 1 });

// Pre-save middleware to update updated_at timestamp
vendorStoreSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Vendor_Store_id
vendorStoreSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Store_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Store', vendorStoreSchema);

