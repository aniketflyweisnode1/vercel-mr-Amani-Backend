const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const pickUpSchema = new mongoose.Schema({
  AutoPuckup: {
    type: Boolean,
    default: false
  },
  EnableServiceFee: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const deliverySchema = new mongoose.Schema({
  AutoDelivery: {
    type: Boolean,
    default: false
  },
  EnableServiceFee: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const providersSchema = new mongoose.Schema({
  Providers_id: {
    type: Number,
    unique: true
  },
  ProviderName: {
    type: String,
    required: [true, 'Provider name is required'],
    trim: true,
    maxlength: [200, 'Provider name cannot exceed 200 characters']
  },
  ProviderStatus: {
    type: String,
    trim: true,
    maxlength: [100, 'Provider status cannot exceed 100 characters']
  },
  ProviderPricing: {
    type: Boolean,
    default: false
  },
  PreparationTime: {
    type: String,
    trim: true,
    maxlength: [50, 'Preparation time cannot exceed 50 characters']
  },
  StoreId: {
    type: Number,
    ref: 'Business_Branch',
    default: null
  },
  PickUp: {
    type: [pickUpSchema],
    default: []
  },
  Delivery: {
    type: [deliverySchema],
    default: []
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

providersSchema.index({ Providers_id: 1 });
providersSchema.index({ Status: 1 });
providersSchema.index({ StoreId: 1 });
providersSchema.index({ ProviderName: 1 });

providersSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

providersSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let ProvidersModel;
try {
  ProvidersModel = mongoose.model('Providers');
} catch (error) {
  providersSchema.plugin(AutoIncrement, { inc_field: 'Providers_id', start_seq: 1 });
  ProvidersModel = mongoose.model('Providers', providersSchema);
}

module.exports = ProvidersModel;
