const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const rewardsSchema = new mongoose.Schema({
  Rewards_id: {
    type: Number,
    unique: true
  },
  Rewards_type_id: {
    type: Number,
    ref: 'Rewards_type',
    required: [true, 'Rewards type ID is required']
  },
  name: {
    type: String,
    required: [true, 'Rewards name is required'],
    trim: true,
    maxlength: [200, 'Rewards name cannot exceed 200 characters']
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

rewardsSchema.index({ Rewards_id: 1 });
rewardsSchema.index({ Rewards_type_id: 1 });
rewardsSchema.index({ name: 1 });
rewardsSchema.index({ Status: 1 });

rewardsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

rewardsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

rewardsSchema.plugin(AutoIncrement, { inc_field: 'Rewards_id', start_seq: 1 });

module.exports = mongoose.model('Rewards', rewardsSchema);


