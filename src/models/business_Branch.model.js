const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessBranchSchema = new mongoose.Schema({
  business_Branch_id: {
    type: Number,
    unique: true
  },
  Business_id: {
    type: Number,
    ref: 'Business_Details',
    default: null
  },
  subscription_id: {
    type: Number,
    ref: 'subscription',
    default: null
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [150, 'First name cannot exceed 150 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [150, 'Last name cannot exceed 150 characters']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  Driving_licenceFile: {
    type: String,
    trim: true,
    maxlength: [500, 'Driving licence file path cannot exceed 500 characters']
  },
  printingTypesetting: {
    type: Boolean,
    default: false
  },
  BranchCount: {
    type: Number,
    default: 0,
    min: [0, 'Branch count cannot be negative']
  },
  EmployeesCount: {
    type: Number,
    default: 0,
    min: [0, 'Employees count cannot be negative']
  },
  DayOpenCount: {
    type: Number,
    default: 0,
    min: [0, 'Day open count cannot be negative']
  },
  GoogleLocaitonAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Google location address cannot exceed 500 characters']
  },
  Address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  StreetNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Street number cannot exceed 50 characters']
  },
  StreetName: {
    type: String,
    trim: true,
    maxlength: [200, 'Street name cannot exceed 200 characters']
  },
  City_id: {
    type: Number,
    ref: 'City',
    default: null
  },
  State_id: {
    type: Number,
    ref: 'State',
    default: null
  },
  Country_id: {
    type: Number,
    ref: 'Country',
    default: null
  },
  Zipcode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zipcode cannot exceed 20 characters']
  },
  EmployeeIdFile: {
    type: String,
    trim: true,
    maxlength: [500, 'Employee ID file path cannot exceed 500 characters']
  },
  FoodServiceLicenseFile: {
    type: String,
    trim: true,
    maxlength: [500, 'Food service license file path cannot exceed 500 characters']
  },
  SericeOfferPOP: {
    type: [{
      offer: {
        type: String,
        trim: true,
        default: ''
      },
      use: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  ThirdPartyDelivery: {
    type: [{
      ThirdParty: {
        type: String,
        trim: true,
        default: ''
      },
      use: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  OrderMethod: {
    type: {
      MobileApp: [{
        facility: {
          type: String,
          trim: true,
          default: ''
        },
        use: {
          type: Boolean,
          default: false
        }
      }],
      Tablet: [{
        facility: {
          type: String,
          trim: true,
          default: ''
        },
        use: {
          type: Boolean,
          default: false
        }
      }]
    },
    default: () => ({
      MobileApp: [],
      Tablet: []
    })
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  BranchImage: {
    type: String,
    trim: true,
    maxlength: [500, 'Branch image path cannot exceed 500 characters']
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

businessBranchSchema.index({ business_Branch_id: 1 });
businessBranchSchema.index({ Business_id: 1 });
businessBranchSchema.index({ subscription_id: 1 });
businessBranchSchema.index({ City_id: 1 });
businessBranchSchema.index({ State_id: 1 });
businessBranchSchema.index({ Country_id: 1 });
businessBranchSchema.index({ Status: 1 });

businessBranchSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let BusinessBranchModel;
try {
  BusinessBranchModel = mongoose.model('Business_Branch');
} catch (error) {
  businessBranchSchema.plugin(AutoIncrement, { inc_field: 'business_Branch_id', start_seq: 1 });
  BusinessBranchModel = mongoose.model('Business_Branch', businessBranchSchema);
}

module.exports = BusinessBranchModel;

