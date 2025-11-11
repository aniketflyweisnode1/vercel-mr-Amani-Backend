const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roomsSchema = new mongoose.Schema({
  Rooms_id: {
    type: Number,
    unique: true
  },
  Room_Categories_id: {
    type: Number,
    ref: 'Room_Categories',
    required: [true, 'Room Category ID is required']
  },
  RoomName: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [200, 'Room name cannot exceed 200 characters']
  },
  RoomType: {
    type: String,
    enum: ['Private', 'Family', 'Friends', 'Everyone'],
    required: [true, 'Room type is required'],
    default: 'Everyone'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  CoverImage: {
    type: String,
    trim: true
  },
  url: {
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
roomsSchema.index({ Rooms_id: 1 });
roomsSchema.index({ Room_Categories_id: 1 });
roomsSchema.index({ created_by: 1 });
roomsSchema.index({ Status: 1 });
roomsSchema.index({ RoomType: 1 });

// Pre-save middleware to update updated_at timestamp
roomsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Rooms_id
roomsSchema.plugin(AutoIncrement, { inc_field: 'Rooms_id', start_seq: 1 });

module.exports = mongoose.model('Rooms', roomsSchema);

