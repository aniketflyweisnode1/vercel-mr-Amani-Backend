const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const giftCardsSchema = new mongoose.Schema({
  GiftCards_id: {
    type: Number,
    unique: true
  },
  GiftCards_type_id: {
    type: Number,
    ref: 'GiftCards_type',
    required: [true, 'Gift card type ID is required']
  },
  name: {
    type: String,
    required: [true, 'Gift card name is required'],
    trim: true,
    maxlength: [200, 'Gift card name cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image path cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  expiryDays: {
    type: Number,
    default: 0,
    min: [0, 'Expiry days cannot be negative']
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

giftCardsSchema.index({ GiftCards_id: 1 });
giftCardsSchema.index({ GiftCards_type_id: 1 });
giftCardsSchema.index({ name: 1 });
giftCardsSchema.index({ Status: 1 });

giftCardsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

giftCardsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

giftCardsSchema.plugin(AutoIncrement, { inc_field: 'GiftCards_id', start_seq: 1 });

module.exports = mongoose.model('GiftCards', giftCardsSchema);


