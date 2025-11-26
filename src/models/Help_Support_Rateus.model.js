const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const helpSupportRateusSchema = new mongoose.Schema({
  Help_Support_Rateus_id: {
    type: Number,
    unique: true
  },
  Branch_Id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  YourFeel: {
    status: {
      type: String,
      trim: true,
      maxlength: [100, 'Status cannot exceed 100 characters']
    },
    Emozi: {
      type: String,
      trim: true,
      maxlength: [50, 'Emoji cannot exceed 50 characters']
    }
  },
  Feedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  Ratings: {
    type: Number,
    min: [0, 'Ratings cannot be negative'],
    max: [5, 'Ratings cannot exceed 5']
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

helpSupportRateusSchema.index({ Help_Support_Rateus_id: 1 });
helpSupportRateusSchema.index({ Branch_Id: 1 });
helpSupportRateusSchema.index({ Status: 1 });

helpSupportRateusSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

helpSupportRateusSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

helpSupportRateusSchema.plugin(AutoIncrement, { inc_field: 'Help_Support_Rateus_id', start_seq: 1 });

module.exports = mongoose.model('Help_Support_Rateus', helpSupportRateusSchema);

