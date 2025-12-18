const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorRateusSchema = new mongoose.Schema({
  Vendor_Rateus_id: {
    type: Number,
    unique: true
  },
  Vendor_Store_id: {
    type: Number,
    ref: 'Vendor_Store',
    required: [true, 'Vendor store ID is required']
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

vendorRateusSchema.index({ Vendor_Rateus_id: 1 });
vendorRateusSchema.index({ Vendor_Store_id: 1 });

vendorRateusSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorRateusSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorRateusSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Rateus_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Rateus', vendorRateusSchema);


