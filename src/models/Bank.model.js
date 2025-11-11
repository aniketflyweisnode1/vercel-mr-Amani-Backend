const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bankSchema = new mongoose.Schema({
  Bank_id: {
    type: Number,
    unique: true
  },
  Bank_name: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [200, 'Bank name cannot exceed 200 characters']
  },
  AccountNo: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    maxlength: [50, 'Account number cannot exceed 50 characters']
  },
  AccountType: {
    type: String,
    trim: true,
    maxlength: [100, 'Account type cannot exceed 100 characters']
  },
  AccountHoladerName: {
    type: String,
    trim: true,
    maxlength: [200, 'Account holder name cannot exceed 200 characters']
  },
  RoutingNo: {
    type: String,
    trim: true,
    maxlength: [50, 'Routing number cannot exceed 50 characters']
  },
  Branch: {
    type: String,
    trim: true,
    maxlength: [200, 'Branch cannot exceed 200 characters']
  },
  User_Id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
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

bankSchema.index({ Bank_id: 1 });
bankSchema.index({ User_Id: 1 });
bankSchema.index({ Status: 1 });

bankSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

bankSchema.plugin(AutoIncrement, { inc_field: 'Bank_id', start_seq: 1 });

module.exports = mongoose.model('Bank', bankSchema);
