const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorProductDisputeSchema = new mongoose.Schema({
  Vendor_Prdocut_Dispute_id: {
    type: Number,
    unique: true
  },
  order_id: {
    type: Number,
    required: [true, 'Order ID is required']
  },
  DisputeType: {
    type: String,
    required: [true, 'Dispute type is required'],
    trim: true,
    maxlength: [200, 'Dispute type cannot exceed 200 characters']
  },
  Description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  imageScreenshot: {
    type: String,
    trim: true,
    maxlength: [500, 'Image screenshot URL cannot exceed 500 characters']
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

vendorProductDisputeSchema.index({ Vendor_Prdocut_Dispute_id: 1 });
vendorProductDisputeSchema.index({ order_id: 1 });
vendorProductDisputeSchema.index({ DisputeType: 1 });
vendorProductDisputeSchema.index({ Status: 1 });
vendorProductDisputeSchema.index({ created_by: 1 });

vendorProductDisputeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

vendorProductDisputeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

vendorProductDisputeSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Prdocut_Dispute_id', start_seq: 1 });

module.exports = mongoose.model('Vendor_Prdocut_Dispute', vendorProductDisputeSchema);

