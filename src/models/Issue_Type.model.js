const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const issueTypeSchema = new mongoose.Schema({
  Issue_Type_id: {
    type: Number,
    unique: true
  },
  Issue_type: {
    type: String,
    required: [true, 'Issue type is required'],
    trim: true,
    maxlength: [200, 'Issue type cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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

issueTypeSchema.index({ Issue_Type_id: 1 });
issueTypeSchema.index({ Issue_type: 1 });
issueTypeSchema.index({ Status: 1 });

issueTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

issueTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

issueTypeSchema.plugin(AutoIncrement, { inc_field: 'Issue_Type_id', start_seq: 1 });

module.exports = mongoose.model('Issue_Type', issueTypeSchema);

