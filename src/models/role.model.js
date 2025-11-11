const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roleSchema = new mongoose.Schema({
  role_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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
roleSchema.index({ role_id: 1 });
roleSchema.index({ name: 1 });
roleSchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
roleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for role_id
roleSchema.plugin(AutoIncrement, { inc_field: 'role_id', start_seq: 1 });

module.exports = mongoose.model('Role', roleSchema);

