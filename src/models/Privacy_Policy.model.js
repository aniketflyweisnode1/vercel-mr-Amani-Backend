const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const privacyPolicySchema = new mongoose.Schema({
  Privacy_Policy_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters']
  },
  emozi: {
    type: String,
    trim: true
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

privacyPolicySchema.index({ Privacy_Policy_id: 1 });
privacyPolicySchema.index({ Status: 1 });

privacyPolicySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

privacyPolicySchema.plugin(AutoIncrement, { inc_field: 'Privacy_Policy_id', start_seq: 1 });

module.exports = mongoose.model('Privacy_Policy', privacyPolicySchema);

