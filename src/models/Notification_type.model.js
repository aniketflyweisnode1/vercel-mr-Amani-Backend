const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationTypeSchema = new mongoose.Schema({
  Notification_type_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Notification type name is required'],
    trim: true,
    maxlength: [200, 'Notification type name cannot exceed 200 characters']
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: [50, 'Emozi cannot exceed 50 characters']
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

notificationTypeSchema.index({ Notification_type_id: 1 });
notificationTypeSchema.index({ name: 1 });
notificationTypeSchema.index({ Status: 1 });

notificationTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

notificationTypeSchema.plugin(AutoIncrement, { inc_field: 'Notification_type_id', start_seq: 1 });

module.exports = mongoose.model('Notification_type', notificationTypeSchema);
