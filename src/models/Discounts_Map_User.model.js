const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const discountsMapUserSchema = new mongoose.Schema({
  Discounts_Map_User_id: {
    type: Number,
    unique: true
  },
  User_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
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

discountsMapUserSchema.index({ Discounts_Map_User_id: 1 });
discountsMapUserSchema.index({ User_id: 1 });
discountsMapUserSchema.index({ business_Branch_id: 1 });
discountsMapUserSchema.index({ Status: 1 });

discountsMapUserSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

discountsMapUserSchema.plugin(AutoIncrement, { inc_field: 'Discounts_Map_User_id', start_seq: 1 });

module.exports = mongoose.model('Discounts_Map_User', discountsMapUserSchema);

