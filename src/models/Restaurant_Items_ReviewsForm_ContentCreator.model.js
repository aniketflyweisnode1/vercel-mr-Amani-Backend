const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reviewsFormContentCreatorSchema = new mongoose.Schema({
  ReviewsForm_ContentCreator_id: {
    type: Number,
    unique: true
  },
  Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  Country: {
    type: String,
    trim: true,
    maxlength: [100, 'Country cannot exceed 100 characters']
  },
  Phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  Budget: {
    type: Number,
    min: [0, 'Budget cannot be negative'],
    default: 0
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

reviewsFormContentCreatorSchema.index({ ReviewsForm_ContentCreator_id: 1 });
reviewsFormContentCreatorSchema.index({ Name: 1 });
reviewsFormContentCreatorSchema.index({ Email: 1 });
reviewsFormContentCreatorSchema.index({ Status: 1 });

reviewsFormContentCreatorSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reviewsFormContentCreatorSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reviewsFormContentCreatorSchema.plugin(AutoIncrement, { inc_field: 'ReviewsForm_ContentCreator_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_Items_ReviewsForm_ContentCreator', reviewsFormContentCreatorSchema);


