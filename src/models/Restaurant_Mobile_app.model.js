const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantMobileAppSchema = new mongoose.Schema({
  Restaurant_Mobile_app_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  WantMobileApp: {
    type: Boolean,
    default: false
  },
  Notificcation: {
    type: Boolean,
    default: false
  },
  Stock_notify_Notficaiton: {
    type: Boolean,
    default: false
  },
  Stock_notify_Email: {
    type: Boolean,
    default: false
  },
  Stock_notify_Phone: {
    type: Boolean,
    default: false
  },
  Country_id: {
    type: Number,
    ref: 'Country',
    default: null
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

restaurantMobileAppSchema.index({ Restaurant_Mobile_app_id: 1 });
restaurantMobileAppSchema.index({ business_Branch_id: 1 });
restaurantMobileAppSchema.index({ user_id: 1 });
restaurantMobileAppSchema.index({ Country_id: 1 });
restaurantMobileAppSchema.index({ Status: 1 });

restaurantMobileAppSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantMobileAppSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantMobileAppSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Mobile_app_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Mobile_app', restaurantMobileAppSchema);

