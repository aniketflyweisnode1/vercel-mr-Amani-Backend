const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productImageDetailSchema = new mongoose.Schema({
  Image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  },
  Details: {
    type: String,
    trim: true,
    maxlength: [2000, 'Details cannot exceed 2000 characters']
  }
}, { _id: false });

const vendorReviewsFormConttentCreatorSchema = new mongoose.Schema({
  Vendor_ReviewsFormConttentCreator_id: {
    type: Number,
    unique: true
  },
  ConttentCreators: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: 'Content creators must be an array'
    }
  },
  PrdocutImageDetails: {
    type: [productImageDetailSchema],
    default: []
  },
  Payment_Options: {
    type: [Number],
    ref: 'PaymentMethods',
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(id => typeof id === 'number' && id > 0);
      },
      message: 'Payment options must be an array of positive numbers'
    }
  },
  linkAccountURL: {
    type: String,
    trim: true,
    maxlength: [500, 'Link account URL cannot exceed 500 characters']
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

vendorReviewsFormConttentCreatorSchema.index({ Vendor_ReviewsFormConttentCreator_id: 1 });
vendorReviewsFormConttentCreatorSchema.index({ Status: 1 });
vendorReviewsFormConttentCreatorSchema.index({ created_by: 1 });

vendorReviewsFormConttentCreatorSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorReviewsFormConttentCreatorSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorReviewsFormConttentCreatorSchema.plugin(AutoIncrement, { inc_field: 'Vendor_ReviewsFormConttentCreator_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_ReviewsFormConttentCreator', vendorReviewsFormConttentCreatorSchema);

