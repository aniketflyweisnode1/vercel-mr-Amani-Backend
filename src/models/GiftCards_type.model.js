const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const giftCardsTypeSchema = new mongoose.Schema({
  GiftCards_type_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Gift card type name is required'],
    trim: true,
    maxlength: [200, 'Gift card type name cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image path cannot exceed 500 characters']
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

giftCardsTypeSchema.index({ GiftCards_type_id: 1 });
giftCardsTypeSchema.index({ name: 1 });
giftCardsTypeSchema.index({ Status: 1 });

giftCardsTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

giftCardsTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

giftCardsTypeSchema.plugin(AutoIncrement, { inc_field: 'GiftCards_type_id', start_seq: 1 });

module.exports = mongoose.model('GiftCards_type', giftCardsTypeSchema);


