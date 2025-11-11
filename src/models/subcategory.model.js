const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const subCategorySchema = new mongoose.Schema({
  subcategory_id: {
    type: Number,
    unique: true
  },
  category_id: {
    type: Number,
    ref: 'Category',
    required: [true, 'Category ID is required']
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
subCategorySchema.index({ subcategory_id: 1 });
subCategorySchema.index({ category_id: 1 });
subCategorySchema.index({ name: 1 });
subCategorySchema.index({ status: 1 });

// Pre-save middleware to update updated_at timestamp
subCategorySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for subcategory_id
subCategorySchema.plugin(AutoIncrement, { inc_field: 'subcategory_id', start_seq: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);

