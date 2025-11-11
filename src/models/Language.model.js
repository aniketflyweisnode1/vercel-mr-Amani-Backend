const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const languageSchema = new mongoose.Schema({
  Language_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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

languageSchema.index({ Language_id: 1 });
languageSchema.index({ name: 1 });
languageSchema.index({ Status: 1 });

languageSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

languageSchema.plugin(AutoIncrement, { inc_field: 'Language_id', start_seq: 1 });

module.exports = mongoose.model('Language', languageSchema);

