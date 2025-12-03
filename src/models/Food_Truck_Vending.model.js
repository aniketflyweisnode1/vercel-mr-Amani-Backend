const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const foodTruckVendingSchema = new mongoose.Schema({
  Food_Truck_Vending_id: {
    type: Number,
    unique: true
  },
  What_Occasion: {
    type: [{
      Type: {
        type: String,
        enum: ['One Time Event', 'Recurring Food Service'],
        required: true
      },
      Status: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  EventName: {
    type: String,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  Website: {
    type: String,
    trim: true,
    maxlength: [500, 'Website cannot exceed 500 characters']
  },
  Occasion: {
    type: [{
      Type: {
        type: String,
        trim: true,
        maxlength: [200, 'Occasion type cannot exceed 200 characters']
      },
      Status: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  CuisineSelection: {
    type: [{
      Type: {
        type: String,
        trim: true,
        maxlength: [200, 'Cuisine type cannot exceed 200 characters']
      },
      Status: {
        type: Boolean,
        default: false
      }
    }],
    default: []
  },
  GuestCount: {
    type: Number,
    min: [1, 'Guest count must be at least 1'],
    integer: true
  },
  StartDate: {
    type: Date
  },
  EndDate: {
    type: Date
  },
  StartTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Start time cannot exceed 50 characters']
  },
  EndTime: {
    type: String,
    trim: true,
    maxlength: [50, 'End time cannot exceed 50 characters']
  },
  MinimumGuarantee: {
    type: Number,
    min: [0, 'Minimum guarantee cannot be negative']
  },
  Address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  City: {
    type: String,
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  State: {
    type: String,
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  zip: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  Country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  Name: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Email: {
    type: String,
    trim: true,
    maxlength: [200, 'Email cannot exceed 200 characters']
  },
  Phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  Budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  IsAgree: {
    type: Boolean,
    default: false
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

foodTruckVendingSchema.index({ Food_Truck_Vending_id: 1 });
foodTruckVendingSchema.index({ Status: 1 });
foodTruckVendingSchema.index({ created_by: 1 });

foodTruckVendingSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

foodTruckVendingSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let FoodTruckVendingModel;
try {
  FoodTruckVendingModel = mongoose.model('Food_Truck_Vending');
} catch (error) {
  foodTruckVendingSchema.plugin(AutoIncrement, { inc_field: 'Food_Truck_Vending_id', start_seq: 1 });
  FoodTruckVendingModel = mongoose.model('Food_Truck_Vending', foodTruckVendingSchema);
}

module.exports = FoodTruckVendingModel;

