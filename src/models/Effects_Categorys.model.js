const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const effectsCategorysSchema = new mongoose.Schema({
  Effects_Categorys_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
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

// Index for better query performance
effectsCategorysSchema.index({ Effects_Categorys_id: 1 });
effectsCategorysSchema.index({ Status: 1 });
effectsCategorysSchema.index({ name: 1 });

// Pre-save middleware to update updated_at timestamp
effectsCategorysSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Effects_Categorys_id
effectsCategorysSchema.plugin(AutoIncrement, { inc_field: 'Effects_Categorys_id', start_seq: 1 });

module.exports = mongoose.model('Effects_Categorys', effectsCategorysSchema);

