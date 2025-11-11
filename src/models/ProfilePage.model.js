const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const profilePageSchema = new mongoose.Schema({
  ProfilePage_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  PageType: {
    type: String,
    enum: ['Personal', 'Professional'],
    required: [true, 'Page type is required'],
    trim: true
  },
  ProfileImage: {
    type: String,
    trim: true
  },
  Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  ProfileInfo: [{
    Title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    Description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    Emozi: {
      type: String,
      trim: true
    }
  }],
  Category_id: {
    type: Number,
    ref: 'Category',
    default: null
  },
  pageCover_image: {
    type: String,
    trim: true
  },
  inviteFriends_id: [{
    type: Number,
    ref: 'User'
  }],
  PageNotification: {
    type: Boolean,
    default: false
  },
  MarketingPromotionalEmails: {
    type: Boolean,
    default: false
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

// Index for better query performance
profilePageSchema.index({ ProfilePage_id: 1 });
profilePageSchema.index({ user_id: 1 });
profilePageSchema.index({ Category_id: 1 });
profilePageSchema.index({ Status: 1 });
profilePageSchema.index({ PageType: 1 });

// Pre-save middleware to update updated_at timestamp
profilePageSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for ProfilePage_id
profilePageSchema.plugin(AutoIncrement, { inc_field: 'ProfilePage_id', start_seq: 1 });

module.exports = mongoose.model('ProfilePage', profilePageSchema);

