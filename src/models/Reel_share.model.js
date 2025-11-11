const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelShareSchema = new mongoose.Schema({
  Real_Post_share_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  share_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Share by user ID is required']
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

reelShareSchema.index({ Real_Post_share_id: 1 });
reelShareSchema.index({ Real_Post_id: 1 });
reelShareSchema.index({ share_by: 1 });
reelShareSchema.index({ Status: 1 });

reelShareSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelShareSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_share_id', start_seq: 1 });

module.exports = mongoose.model('Reel_share', reelShareSchema);

