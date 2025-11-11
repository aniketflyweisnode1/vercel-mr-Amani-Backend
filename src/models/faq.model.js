const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const faqSchema = new mongoose.Schema({
  faq_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  emozi: {
    type: String,
    trim: true
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

faqSchema.index({ faq_id: 1 });
faqSchema.index({ Status: 1 });

faqSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

faqSchema.plugin(AutoIncrement, { inc_field: 'faq_id', start_seq: 1 });

module.exports = mongoose.model('faq', faqSchema);

