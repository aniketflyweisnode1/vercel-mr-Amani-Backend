const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelViewSchema = new mongoose.Schema({
  Real_Post_View_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  view_by: {
    type: Number,
    ref: 'User',
    required: [true, 'View by user ID is required']
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
reelViewSchema.index({ Real_Post_View_id: 1 });
reelViewSchema.index({ Real_Post_id: 1 });
reelViewSchema.index({ view_by: 1 });
reelViewSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
reelViewSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Real_Post_View_id
reelViewSchema.plugin(AutoIncrement, { inc_field: 'Real_Post_View_id', start_seq: 1 });

module.exports = mongoose.model('Reel_View', reelViewSchema);

