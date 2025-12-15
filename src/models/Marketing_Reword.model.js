const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const marketingRewordSchema = new mongoose.Schema({
  Marketing_Reword_id: {
    type: Number,
    unique: true
  },
  Brnach_id: {
    type: Number,
    required: [true, 'Branch ID is required']
  },
  loyalityRewords: {
    type: Boolean,
    default: false
  },
  singular: {
    type: String,
    trim: true,
    maxlength: [200, 'Singular cannot exceed 200 characters']
  },
  plural: {
    type: String,
    trim: true,
    maxlength: [200, 'Plural cannot exceed 200 characters']
  },
  pointsRedemption: {
    type: Number,
    default: 0,
    min: [0, 'Points redemption cannot be negative']
  },
  RedemptionValue: {
    type: Number,
    default: 0,
    min: [0, 'Redemption value cannot be negative']
  },
  Status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
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
marketingRewordSchema.index({ Marketing_Reword_id: 1 });
marketingRewordSchema.index({ Brnach_id: 1 });
marketingRewordSchema.index({ Status: 1 });

// Pre-save middleware to update updated_at timestamp
marketingRewordSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for Marketing_Reword_id
marketingRewordSchema.plugin(AutoIncrement, { inc_field: 'Marketing_Reword_id', start_seq: 1 });

module.exports = mongoose.model('Marketing_Reword', marketingRewordSchema);
