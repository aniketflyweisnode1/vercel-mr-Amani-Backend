const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpFeedbackSchema = new mongoose.Schema({
  Help_Feedback_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  ScreenshotsorRecording: {
    type: String,
    trim: true
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
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

helpFeedbackSchema.index({ Help_Feedback_id: 1 });
helpFeedbackSchema.index({ created_by: 1 });
helpFeedbackSchema.index({ Status: 1 });

helpFeedbackSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpFeedbackSchema.plugin(AutoIncrement, { inc_field: 'Help_Feedback_id', start_seq: 1 });

module.exports = mongoose.model('Help_Feedback', helpFeedbackSchema);

