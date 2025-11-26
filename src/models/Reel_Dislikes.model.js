const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reelDislikesSchema = new mongoose.Schema({
  Reel_Dislikes_id: {
    type: Number,
    unique: true
  },
  Real_Post_id: {
    type: Number,
    ref: 'Reel',
    required: [true, 'Reel ID is required']
  },
  DislikesBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Dislike by user ID is required']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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

reelDislikesSchema.index({ Reel_Dislikes_id: 1 });
reelDislikesSchema.index({ Real_Post_id: 1 });
reelDislikesSchema.index({ DislikesBy: 1 });
reelDislikesSchema.index({ Status: 1 });

reelDislikesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

reelDislikesSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

reelDislikesSchema.plugin(AutoIncrement, { inc_field: 'Reel_Dislikes_id', start_seq: 1 });

module.exports = mongoose.model('Reel_Dislikes', reelDislikesSchema);

