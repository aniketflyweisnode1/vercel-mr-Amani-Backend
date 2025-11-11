const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categorySchema = new mongoose.Schema({
  category_id: {
    type: Number,
    unique: true
  },
  service_id: {
    type: Number,
    ref: 'Services',
    required: [true, 'Service ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  emozji: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  status: {
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
categorySchema.index({ category_id: 1 });
categorySchema.index({ service_id: 1 });
categorySchema.index({ name: 1 });
categorySchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
categorySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for category_id
categorySchema.plugin(AutoIncrement, { inc_field: 'category_id', start_seq: 1 });

module.exports = mongoose.model('Category', categorySchema);

