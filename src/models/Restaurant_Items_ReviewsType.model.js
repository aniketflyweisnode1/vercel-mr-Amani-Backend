const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewsTypeSchema = new mongoose.Schema({
  Restaurant_Items_ReviewsType_id: {
    type: Number,
    unique: true
  },
  ReviewsType: {
    type: String,
    required: [true, 'Reviews type is required'],
    trim: true,
    maxlength: [150, 'Reviews type cannot exceed 150 characters']
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

reviewsTypeSchema.index({ Restaurant_Items_ReviewsType_id: 1 });
reviewsTypeSchema.index({ ReviewsType: 1 });
reviewsTypeSchema.index({ Status: 1 });

reviewsTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reviewsTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reviewsTypeSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Items_ReviewsType_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Items_ReviewsType', reviewsTypeSchema);


