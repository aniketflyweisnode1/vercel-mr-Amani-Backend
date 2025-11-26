const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpSupportFaqSchema = new mongoose.Schema({
  Help_Support_Faq_id: {
    type: Number,
    unique: true
  },
  Branch_Id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  type: {
    type: String,
    enum: ['Orders', 'Payments', 'Delivery', 'Account', 'Receipts', 'Other'],
    required: [true, 'Type is required']
  },
  Question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  attechFile: {
    type: String,
    trim: true,
    maxlength: [500, 'Attach file path cannot exceed 500 characters']
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

helpSupportFaqSchema.index({ Help_Support_Faq_id: 1 });
helpSupportFaqSchema.index({ Branch_Id: 1 });
helpSupportFaqSchema.index({ type: 1 });
helpSupportFaqSchema.index({ Status: 1 });

helpSupportFaqSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpSupportFaqSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

helpSupportFaqSchema.plugin(AutoIncrement, { inc_field: 'Help_Support_Faq_id', start_seq: 1 });

module.exports = mongoose.model('Help_Support_Faq', helpSupportFaqSchema);

