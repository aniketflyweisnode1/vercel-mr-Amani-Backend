const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelSchema = new mongoose.Schema({
  Real_Post_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  Discription: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  image: {
    type: [String],
    default: []
  },
  emozi: {
    type: String,
    trim: true
  },
  VideoUrl: {
    type: [String],
    default: []
  },
  Coverimage: {
    type: String,
    trim: true
  },
  Songs: {
    type: String,
    trim: true
  },
  capiton: {
    type: String,
    trim: true,
    maxlength: [1000, 'Caption cannot exceed 1000 characters']
  },
  hashtag: {
    type: String,
    trim: true
  },
  ReelType: {
    type: String,
    enum: ['Post', 'Story'],
    required: [true, 'Reel type is required'],
    default: 'Post'
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
reelSchema.index({ Real_Post_id: 1 });
reelSchema.index({ created_by: 1 });
reelSchema.index({ Status: 1 });
reelSchema.index({ ReelType: 1 });

// Pre-save middleware to update updated_at timestamp
reelSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Real_Post_id
reelSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_id', start_seq: 1 });

module.exports = mongoose.model('Reel', reelSchema);

