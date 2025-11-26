const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const seoManagementSchema = new mongoose.Schema({
  SEO_Management_id: {
    type: Number,
    unique: true
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
  },
  website: {
    type: String,
    trim: true,
    required: [true, 'Website is required']
  },
  KeyWord: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
      },
      message: 'KeyWord must be an array of strings'
    }
  },
  TargetPositons: {
    type: String,
    trim: true,
    maxlength: [500, 'Target positions cannot exceed 500 characters']
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

seoManagementSchema.index({ SEO_Management_id: 1 });
seoManagementSchema.index({ business_Branch_id: 1 });
seoManagementSchema.index({ Status: 1 });

seoManagementSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

seoManagementSchema.plugin(AutoIncrement, { inc_field: 'SEO_Management_id', start_seq: 1 });

module.exports = mongoose.model('SEO_Management', seoManagementSchema);

