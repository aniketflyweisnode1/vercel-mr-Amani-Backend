const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationSchema = new mongoose.Schema({
  Notification_id: {
    type: Number,
    unique: true
  },
  Notification_type_id: {
    type: Number,
    ref: 'Notification_type',
    required: [true, 'Notification type is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User is required']
  },
  Notification: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Notification cannot exceed 1000 characters']
  },
  routes: {
    type: String,
    trim: true,
    maxlength: [500, 'Routes cannot exceed 500 characters']
  },
  isRead: {
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

notificationSchema.index({ Notification_id: 1 });
notificationSchema.index({ Notification_type_id: 1 });
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ Status: 1 });

notificationSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

notificationSchema.plugin(AutoIncrement, { inc_field: 'Notification_id', start_seq: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
