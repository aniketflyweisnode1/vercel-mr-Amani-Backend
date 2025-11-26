const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const departmentsSchema = new mongoose.Schema({
  Departments_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [200, 'Department name cannot exceed 200 characters']
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

departmentsSchema.index({ Departments_id: 1 });
departmentsSchema.index({ name: 1 });
departmentsSchema.index({ Status: 1 });

departmentsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

departmentsSchema.plugin(AutoIncrement, { inc_field: 'Departments_id', start_seq: 1 });

module.exports = mongoose.model('Departments', departmentsSchema);



