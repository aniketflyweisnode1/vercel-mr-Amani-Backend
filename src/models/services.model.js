const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const servicesSchema = new mongoose.Schema({
  service_id: {
    type: Number,
    unique: true
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
servicesSchema.index({ service_id: 1 });
servicesSchema.index({ name: 1 });
servicesSchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
servicesSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for service_id
servicesSchema.plugin(AutoIncrement, { inc_field: 'service_id', start_seq: 1 });

module.exports = mongoose.model('Services', servicesSchema);

