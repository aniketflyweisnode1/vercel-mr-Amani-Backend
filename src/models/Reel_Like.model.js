const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelLikeSchema = new mongoose.Schema({
  Real_Post_Like_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  Like_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Like by user ID is required']
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

reelLikeSchema.index({ Real_Post_Like_id: 1 });
reelLikeSchema.index({ Real_Post_id: 1 });
reelLikeSchema.index({ Like_by: 1 });
reelLikeSchema.index({ Status: 1 });

reelLikeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelLikeSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_Like_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Like', reelLikeSchema);

