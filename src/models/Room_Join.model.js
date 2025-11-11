const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const roomJoinSchema = new mongoose.Schema({
  Room_Join_id: {
    type: Number,
    unique: true
  },
  Room_id: {
    type: Number,
    ref: 'Rooms',
    required: [true, 'Room ID is required']
  },
  join_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Join by user ID is required']
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
roomJoinSchema.index({ Room_Join_id: 1 });
roomJoinSchema.index({ Room_id: 1 });
roomJoinSchema.index({ join_by: 1 });
roomJoinSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
roomJoinSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Room_Join_id
roomJoinSchema.plugin(AutoIncrement, { inc_field: 'Room_Join_id', start_seq: 1 });

module.exports = mongoose.model('Room_Join', roomJoinSchema);

