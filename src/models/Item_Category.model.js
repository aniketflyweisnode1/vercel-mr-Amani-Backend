const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemCategorySchema = new mongoose.Schema({
  item_Category_id: {
    type: Number,
    unique: true
  },
  item_type_id: {
    type: Number,
    ref: 'Item_type',
    required: [true, 'Item type ID is required']
  },
  CategoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [150, 'Category name cannot exceed 150 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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

itemCategorySchema.index({ item_Category_id: 1 });
itemCategorySchema.index({ item_type_id: 1 });
itemCategorySchema.index({ CategoryName: 1 });
itemCategorySchema.index({ Status: 1 });

itemCategorySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

itemCategorySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

itemCategorySchema.plugin(AutoIncrement, { inc_field: 'item_Category_id', start_seq: 1 });

module.exports = mongoose.model('Item_Category', itemCategorySchema);
