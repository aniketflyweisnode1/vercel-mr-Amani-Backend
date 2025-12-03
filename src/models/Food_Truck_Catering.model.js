const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const foodTruckCateringSchema = new mongoose.Schema({
  Food_Truck_Catering_id: {
    type: Number,
    unique: true
  },
  Occasion: {
    type: String,
    enum: ['Business', 'Personal'],
    required: [true, 'Occasion is required']
  },
  Wedding: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  Cuisine_Selection: {
    type: [String],
    default: []
  },
  FoodsTime: {
    type: String,
    enum: ['Lunch', 'Breakfast', 'Dessert', 'Dinner'],
    default: null
  },
  Dishes: {
    type: String,
    enum: ['Main', 'Side', 'Drink', 'Dessert'],
    default: null
  },
  GuestCount: {
    type: Number,
    min: [1, 'Guest count must be at least 1'],
    integer: true
  },
  Foods: {
    type: [String],
    default: []
  },
  Dessert: {
    type: [String],
    default: []
  },
  Drinks: {
    type: [String],
    default: []
  },
  StartDate: {
    type: Date
  },
  StartTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Start time cannot exceed 50 characters']
  },
  EndDate: {
    type: Date
  },
  EndTime: {
    type: String,
    trim: true,
    maxlength: [50, 'End time cannot exceed 50 characters']
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

foodTruckCateringSchema.index({ Food_Truck_Catering_id: 1 });
foodTruckCateringSchema.index({ Occasion: 1 });
foodTruckCateringSchema.index({ Status: 1 });
foodTruckCateringSchema.index({ created_by: 1 });

foodTruckCateringSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

foodTruckCateringSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let FoodTruckCateringModel;
try {
  FoodTruckCateringModel = mongoose.model('Food_Truck_Catering');
} catch (error) {
  foodTruckCateringSchema.plugin(AutoIncrement, { inc_field: 'Food_Truck_Catering_id', start_seq: 1 });
  FoodTruckCateringModel = mongoose.model('Food_Truck_Catering', foodTruckCateringSchema);
}

module.exports = FoodTruckCateringModel;

