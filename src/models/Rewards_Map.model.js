const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const rewardsMapSchema = new mongoose.Schema({
  Rewards_Map_id: {
    type: Number,
    unique: true
  },
  Rewards_id: {
    type: Number,
    ref: 'Rewards',
    required: [true, 'Rewards ID is required']
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

rewardsMapSchema.index({ Rewards_Map_id: 1 });
rewardsMapSchema.index({ Rewards_id: 1 });
rewardsMapSchema.index({ user_id: 1 });
rewardsMapSchema.index({ ExpiryStatus: 1 });
rewardsMapSchema.index({ Status: 1 });

rewardsMapSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

rewardsMapSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

rewardsMapSchema.plugin(AutoIncrement, { inc_field: 'Rewards_Map_id', start_seq: 1 });

module.exports = mongoose.model('Rewards_Map', rewardsMapSchema);


