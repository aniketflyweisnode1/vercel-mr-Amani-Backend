const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const marketingPromotionsRewardSchema = new mongoose.Schema({
  Marketing_Promotions_Reward_id: {
    type: Number,
    unique: true
  },
  loyaltyRewords: {
    type: Boolean,
    default: false
  },
  singular: {
    type: String,
    required: [true, 'Singular reward label is required'],
    trim: true,
    maxlength: [200, 'Singular label cannot exceed 200 characters']
  },
  plural: {
    type: String,
    required: [true, 'Plural reward label is required'],
    trim: true,
    maxlength: [200, 'Plural label cannot exceed 200 characters']
  },
  PointsRedemption: {
    type: Number,
    min: [0, 'PointsRedemption cannot be negative'],
    required: [true, 'PointsRedemption is required']
  },
  RedempitonValue: {
    type: Number,
    min: [0, 'RedempitonValue cannot be negative'],
    required: [true, 'RedempitonValue is required']
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

marketingPromotionsRewardSchema.index({ Marketing_Promotions_Reward_id: 1 });
marketingPromotionsRewardSchema.index({ business_Branch_id: 1 });
marketingPromotionsRewardSchema.index({ Status: 1 });

marketingPromotionsRewardSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

marketingPromotionsRewardSchema.plugin(AutoIncrement, {
  inc_field: 'Marketing_Promotions_Reward_id',
  start_seq: 1
});

module.exports = mongoose.model('Marketing_Promotions_Reward', marketingPromotionsRewardSchema);

