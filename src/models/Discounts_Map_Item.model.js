const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const discountsMapItemSchema = new mongoose.Schema({
  Discounts_Map_Item_id: {
    type: Number,
    unique: true
  },
  item_id: {
    type: Number,
    ref: 'Item',
    required: [true, 'Item ID is required']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
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

discountsMapItemSchema.index({ Discounts_Map_Item_id: 1 });
discountsMapItemSchema.index({ item_id: 1 });
discountsMapItemSchema.index({ business_Branch_id: 1 });
discountsMapItemSchema.index({ Status: 1 });

discountsMapItemSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

discountsMapItemSchema.plugin(AutoIncrement, { inc_field: 'Discounts_Map_Item_id', start_seq: 1 });

module.exports = mongoose.model('Discounts_Map_Item', discountsMapItemSchema);

