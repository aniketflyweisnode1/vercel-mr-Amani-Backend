const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelAddUserSchema = new mongoose.Schema({
  Reel_Add_User_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  Reel_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
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
reelAddUserSchema.index({ Reel_Add_User_id: 1 });
reelAddUserSchema.index({ user_id: 1 });
reelAddUserSchema.index({ Reel_id: 1 });
reelAddUserSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
reelAddUserSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Reel_Add_User_id
reelAddUserSchema.plugin(AutoIncrement, { inc_field: 'Reel_Add_User_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Add_User', reelAddUserSchema);

