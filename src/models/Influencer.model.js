const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessDocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [200, 'Document name cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true
  }
}, { _id: false });

const influencerSchema = new mongoose.Schema({
  Influencer_id: {
    type: Number,
    unique: true
  },
  User_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  IdVerfication_type: {
    type: String,
    trim: true,
    maxlength: [100, 'ID verification type cannot exceed 100 characters']
  },
  VerificationId_Image: {
    type: String,
    trim: true
  },
  TaxInformationType: {
    type: String,
    trim: true,
    maxlength: [100, 'Tax information type cannot exceed 100 characters']
  },
  Tax_Image: {
    type: String,
    trim: true
  },
  Bank_id: {
    type: Number,
    ref: 'Bank',
    required: [true, 'Bank ID is required']
  },
  BusinessDcouments: {
    type: [businessDocumentSchema],
    default: []
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

influencerSchema.index({ Influencer_id: 1 });
influencerSchema.index({ User_id: 1 });
influencerSchema.index({ Bank_id: 1 });
influencerSchema.index({ Status: 1 });

influencerSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

influencerSchema.plugin(AutoIncrement, { inc_field: 'Influencer_id', start_seq: 1 });

module.exports = mongoose.model('Influencer', influencerSchema);
