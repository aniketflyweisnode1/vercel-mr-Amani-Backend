const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const branchMapBankSchema = new mongoose.Schema({
  Branch_map_Bank_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Bank_id: {
    type: Number,
    ref: 'Bank',
    required: [true, 'Bank ID is required']
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

branchMapBankSchema.index({ Branch_map_Bank_id: 1 });
branchMapBankSchema.index({ Branch_id: 1 });
branchMapBankSchema.index({ Bank_id: 1 });
branchMapBankSchema.index({ Status: 1 });
branchMapBankSchema.index({ created_by: 1 });

branchMapBankSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

branchMapBankSchema.plugin(AutoIncrement, { inc_field: 'Branch_map_Bank_id', start_seq: 1 });

module.exports = mongoose.model('Branch_map_Bank', branchMapBankSchema);


