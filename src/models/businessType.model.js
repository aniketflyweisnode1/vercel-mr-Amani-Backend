const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessTypeSchema = new mongoose.Schema({
  businessType_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Business type name is required'],
    trim: true,
    maxlength: [200, 'Business type name cannot exceed 200 characters']
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

businessTypeSchema.index({ businessType_id: 1 });
businessTypeSchema.index({ Status: 1 });

businessTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

businessTypeSchema.plugin(AutoIncrement, { inc_field: 'businessType_id', start_seq: 1 });

module.exports = mongoose.model('BusinessType', businessTypeSchema);

