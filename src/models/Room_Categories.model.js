const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roomCategoriesSchema = new mongoose.Schema({
  Room_Categories_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Discription: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  image: {
    type: String,
    trim: true
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

// Index for better query performance
roomCategoriesSchema.index({ Room_Categories_id: 1 });
roomCategoriesSchema.index({ created_by: 1 });
roomCategoriesSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
roomCategoriesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Room_Categories_id
roomCategoriesSchema.plugin(AutoIncrement, { inc_field: 'Room_Categories_id', start_seq: 1 });

module.exports = mongoose.model('Room_Categories', roomCategoriesSchema);

