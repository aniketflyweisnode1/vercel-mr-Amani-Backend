const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewStatusEnum = ['Excellent', 'Good', 'Average', 'Poor'];

const restaurantItemReviewSchema = new mongoose.Schema({
  Restaurant_Items_Reviews_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Restaurant_Items_ReviewsType_id: {
    type: Number,
    ref: 'Restaurant_Items_ReviewsType',
    required: [true, 'Review type ID is required']
  },
  Restaurant_Items_id: {
    type: Number,
    ref: 'Restaurant_Items',
    required: [true, 'Restaurant item ID is required']
  },
  Reating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  ReviewsStatus: {
    type: String,
    enum: reviewStatusEnum,
    default: 'Poor'
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  User_id: {
    type: Number,
    ref: 'User',
    default: null
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

restaurantItemReviewSchema.index({ Restaurant_Items_Reviews_id: 1 });
restaurantItemReviewSchema.index({ business_Branch_id: 1 });
restaurantItemReviewSchema.index({ Restaurant_Items_id: 1 });
restaurantItemReviewSchema.index({ Restaurant_Items_ReviewsType_id: 1 });
restaurantItemReviewSchema.index({ ReviewsStatus: 1 });
restaurantItemReviewSchema.index({ User_id: 1 });

restaurantItemReviewSchema.pre('save', function (next) {
  if (this.isModified('Reating') || this.isNew) {
    this.ReviewsStatus = mapRatingToStatus(this.Reating);
  }
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantItemReviewSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update && Object.prototype.hasOwnProperty.call(update, 'Reating')) {
    update.ReviewsStatus = mapRatingToStatus(update.Reating);
    this.set(update);
  } else if (update && update.$set && Object.prototype.hasOwnProperty.call(update.$set, 'Reating')) {
    update.$set.ReviewsStatus = mapRatingToStatus(update.$set.Reating);
  }
  this.set({ updated_at: new Date() });
  next();
});

restaurantItemReviewSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_Items_Reviews_id', start_seq: 1 });

function mapRatingToStatus(rating) {
  if (rating >= 5) return 'Excellent';
  if (rating >= 4) return 'Good';
  if (rating >= 2) return 'Average';
  if (rating >= 1) return 'Poor';
  return 'Poor';
}

module.exports = mongoose.model('Restaurant_Items_Reviews', restaurantItemReviewSchema);


