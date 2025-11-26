const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessDetailsSchema = new mongoose.Schema({
  Business_Details_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  Branches_count: {
    type: Number,
    default: 0,
    min: [0, 'Branches count cannot be negative']
  },
  Employees_count: {
    type: Number,
    default: 0,
    min: [0, 'Employees count cannot be negative']
  },
  Days_open_count: {
    type: Number,
    default: 0,
    min: [0, 'Days open count cannot be negative']
  },
  google_office_address: {
    type: String,
    trim: true,
    maxlength: [500, 'Google office address cannot exceed 500 characters']
  },
  office_address: {
    type: String,
    trim: true,
    maxlength: [500, 'Office address cannot exceed 500 characters']
  },
  StreetNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Street number cannot exceed 50 characters']
  },
  Streetname: {
    type: String,
    trim: true,
    maxlength: [200, 'Street name cannot exceed 200 characters']
  },
  City: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  state: {
    type: String,
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zipcode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zipcode cannot exceed 20 characters']
  },
  BussinessName: {
    type: String,
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  BusinessType_id: {
    type: Number,
    ref: 'BusinessType',
    default: null
  },
  EmployeeIds_file: {
    type: String,
    trim: true,
    maxlength: [500, 'Employee IDs file path cannot exceed 500 characters']
  },
  foodServiceLicense_file: {
    type: String,
    trim: true,
    maxlength: [500, 'Food service license file path cannot exceed 500 characters']
  },
  Service: {
    type: mongoose.Schema.Types.Mixed,
    default: { AllneedaEats: false, Website: false }
  },
  IIIrdParty: {
    type: mongoose.Schema.Types.Mixed,
    default: { uberEats: false, DoorDash: false, GrubHub: false }
  },
  mobileapp: {
    type: Boolean,
    default: false
  },
  Tablet: {
    type: Boolean,
    default: false
  },
  subscription_Id: {
    type: Number,
    ref: 'Subscription',
    default: null
  },
  emozi: {
    type: String,
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

businessDetailsSchema.index({ Business_Details_id: 1 });
businessDetailsSchema.index({ user_id: 1 });
businessDetailsSchema.index({ BusinessType_id: 1 });
businessDetailsSchema.index({ subscription_Id: 1 });
businessDetailsSchema.index({ Status: 1 });

businessDetailsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

businessDetailsSchema.plugin(AutoIncrement, { inc_field: 'Business_Details_id', start_seq: 1 });

module.exports = mongoose.model('Business_Details', businessDetailsSchema);

