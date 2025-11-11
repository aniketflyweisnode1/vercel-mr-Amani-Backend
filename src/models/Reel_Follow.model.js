const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelFollowSchema = new mongoose.Schema({
  Real_Post_Follow_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  Follow_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Follow by user ID is required']
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

reelFollowSchema.index({ Real_Post_Follow_id: 1 });
reelFollowSchema.index({ Real_Post_id: 1 });
reelFollowSchema.index({ Follow_by: 1 });
reelFollowSchema.index({ Status: 1 });

reelFollowSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelFollowSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_Follow_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Follow', reelFollowSchema);

