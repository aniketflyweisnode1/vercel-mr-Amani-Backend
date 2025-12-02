const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringEventSchema = new mongoose.Schema({
  Catering_Event_id: {
    type: Number,
    unique: true
  },
  Catering_Eventtype_id: {
    type: Number,
    ref: 'Catering_EventType',
    required: [true, 'Catering Event Type ID is required']
  },
  EventName: {
    type: String,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  userName: {
    type: String,
    trim: true,
    maxlength: [200, 'User name cannot exceed 200 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  DateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  DeliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  DeliveryTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Delivery time cannot exceed 50 characters']
  },
  NumberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Number of guests must be at least 1'],
    integer: true
  },
  CuisinePreference: {
    type: String,
    trim: true,
    maxlength: [200, 'Cuisine preference cannot exceed 200 characters']
  },
  BudgetPerPerson: {
    type: Number,
    min: [0, 'Budget per person cannot be negative']
  },
  SpecialInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
  },
  EventMode: {
    type: String,
    enum: ['Catering', 'Vending'],
    trim: true
  },
  Receive: {
    type: String,
    enum: ['Pickup', 'Delivery'],
    trim: true
  },
  website: {
    type: String,
    trim: true,
    maxlength: [500, 'Website cannot exceed 500 characters']
  },
  Occasion: [{
    type: {
      type: String,
      trim: true,
      maxlength: [200, 'Occasion type cannot exceed 200 characters']
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
  CuisineSelection: [{
    type: {
      type: String,
      trim: true,
      maxlength: [200, 'Cuisine type cannot exceed 200 characters']
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
  Days: [{
    Day: {
      type: String,
      trim: true,
      maxlength: [50, 'Day cannot exceed 50 characters']
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
    }
  }],
  city: {
    type: Number,
    ref: 'City',
    default: null
  },
  state: {
    type: Number,
    ref: 'State',
    default: null
  },
  zip: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  country: {
    type: Number,
    ref: 'Country',
    default: null
  },
  minimumGuarante: {
    type: Number,
    min: [0, 'Minimum guarantee cannot be negative']
  },
  mobile: {
    type: String,
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email cannot exceed 200 characters']
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

cateringEventSchema.index({ Catering_Event_id: 1 });
cateringEventSchema.index({ Catering_Eventtype_id: 1 });
cateringEventSchema.index({ Status: 1 });
cateringEventSchema.index({ created_by: 1 });

cateringEventSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let CateringEventModel;
try {
  CateringEventModel = mongoose.model('Catering_Event');
} catch (error) {
  cateringEventSchema.plugin(AutoIncrement, { inc_field: 'Catering_Event_id', start_seq: 1 });
  CateringEventModel = mongoose.model('Catering_Event', cateringEventSchema);
}

module.exports = CateringEventModel;

