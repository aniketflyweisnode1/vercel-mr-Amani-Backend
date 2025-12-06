const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const socketChatSchema = new mongoose.Schema({
  Chat_id: {
    type: Number,
    unique: true
  },
  UserName: {
    type: String,
    trim: true,
    maxlength: [200, 'User name cannot exceed 200 characters']
  },
  User_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  TextMessage: {
    type: String,
    trim: true,
    maxlength: [5000, 'Text message cannot exceed 5000 characters']
  },
  fileImage: {
    type: String,
    trim: true,
    maxlength: [500, 'File image path cannot exceed 500 characters']
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
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

socketChatSchema.index({ Chat_id: 1 });
socketChatSchema.index({ User_id: 1 });
socketChatSchema.index({ Status: 1 });
socketChatSchema.index({ created_at: 1 });

socketChatSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

socketChatSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let SocketChatModel;
try {
  SocketChatModel = mongoose.model('SocketChat');
} catch (error) {
  socketChatSchema.plugin(AutoIncrement, { inc_field: 'Chat_id', start_seq: 1 });
  SocketChatModel = mongoose.model('SocketChat', socketChatSchema);
}

module.exports = SocketChatModel;

