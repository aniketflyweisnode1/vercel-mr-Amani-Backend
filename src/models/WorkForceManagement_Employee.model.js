const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const accessPermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [200, 'Permission name cannot exceed 200 characters'],
    required: [true, 'Permission name is required']
  },
  Access: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const workForceEmployeeSchema = new mongoose.Schema({
  WorkForceManagement_Employee_id: {
    type: Number,
    unique: true
  },
  Role_id: {
    type: Number,
    ref: 'Role',
    required: [true, 'Role ID is required']
  },
  type: {
    type: String,
    enum: ['Branch', 'Department'],
    required: [true, 'Type is required'],
    trim: true
  },
  First_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [100, 'First name cannot exceed 100 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [100, 'Last name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email cannot exceed 200 characters'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    unique: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  Department_id: {
    type: Number,
    ref: 'Departments',
    required: [true, 'Department ID is required']
  },
  employee_pic: {
    type: String,
    trim: true,
    maxlength: [500, 'Employee picture path cannot exceed 500 characters']
  },
  AcessPermission: {
    type: [accessPermissionSchema],
    default: []
  },
  Permission: {
    type: String,
    trim: true,
    maxlength: [500, 'Permission description cannot exceed 500 characters']
  },
  branchPermission: {
    type: Boolean,
    default: false
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

workForceEmployeeSchema.index({ WorkForceManagement_Employee_id: 1 });
workForceEmployeeSchema.index({ Role_id: 1 });
workForceEmployeeSchema.index({ Department_id: 1 });
workForceEmployeeSchema.index({ email: 1 }, { unique: true });
workForceEmployeeSchema.index({ Status: 1 });

workForceEmployeeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

workForceEmployeeSchema.plugin(AutoIncrement, { inc_field: 'WorkForceManagement_Employee_id', start_seq: 1 });

module.exports = mongoose.model('WorkForceManagement_Employee', workForceEmployeeSchema);



