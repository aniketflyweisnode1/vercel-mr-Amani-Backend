const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const rewardsTypeSchema = new mongoose.Schema({
  Rewards_type_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Rewards type name is required'],
    trim: true,
    maxlength: [200, 'Rewards type name cannot exceed 200 characters']
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

rewardsTypeSchema.index({ Rewards_type_id: 1 });
rewardsTypeSchema.index({ name: 1 });
rewardsTypeSchema.index({ Status: 1 });

rewardsTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

rewardsTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

rewardsTypeSchema.plugin(AutoIncrement, { inc_field: 'Rewards_type_id', start_seq: 1 });

module.exports = mongoose.model('Rewards_type', rewardsTypeSchema);


