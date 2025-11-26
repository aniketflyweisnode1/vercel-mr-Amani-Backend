const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const giftCardsMapSchema = new mongoose.Schema({
  GiftCards_Map_id: {
    type: Number,
    unique: true
  },
  GiftCards_id: {
    type: Number,
    ref: 'GiftCards',
    required: [true, 'Gift card ID is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  ExpiryDate: {
    type: Date,
    default: null
  },
  ExpiryStatus: {
    type: Boolean,
    default: true
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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

giftCardsMapSchema.index({ GiftCards_Map_id: 1 });
giftCardsMapSchema.index({ GiftCards_id: 1 });
giftCardsMapSchema.index({ user_id: 1 });
giftCardsMapSchema.index({ ExpiryStatus: 1 });
giftCardsMapSchema.index({ Status: 1 });

giftCardsMapSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

giftCardsMapSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

giftCardsMapSchema.plugin(AutoIncrement, { inc_field: 'GiftCards_Map_id', start_seq: 1 });

module.exports = mongoose.model('GiftCards_Map', giftCardsMapSchema);


