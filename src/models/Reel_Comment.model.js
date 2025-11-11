const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelCommentSchema = new mongoose.Schema({
  Real_Post_Comment_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  Comment_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Comment by user ID is required']
  },
  commentText: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [2000, 'Comment text cannot exceed 2000 characters']
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

reelCommentSchema.index({ Real_Post_Comment_id: 1 });
reelCommentSchema.index({ Real_Post_id: 1 });
reelCommentSchema.index({ Comment_by: 1 });
reelCommentSchema.index({ Status: 1 });

reelCommentSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelCommentSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_Comment_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Comment', reelCommentSchema);

