const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const contactUsSchema = new mongoose.Schema({
  ContactUs_id: {
    type: Number,
    unique: true
  },
  phoneCall: [{
    MobileNo: {
      type: String,
      trim: true
    },
    Emozi: {
      type: String,
      trim: true
    },
    LineText: {
      type: String,
      trim: true
    }
  }],
  Email: [{
    mail: {
      type: String,
      trim: true
    },
    Emozi: {
      type: String,
      trim: true
    },
    LineText: {
      type: String,
      trim: true
    }
  }],
  ChatWhatsapp: [{
    MobileNo: {
      type: String,
      trim: true
    },
    Emozi: {
      type: String,
      trim: true
    },
    LineText: {
      type: String,
      trim: true
    }
  }],
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

contactUsSchema.index({ ContactUs_id: 1 });
contactUsSchema.index({ Status: 1 });

contactUsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

contactUsSchema.plugin(AutoIncrement, { inc_field: 'ContactUs_id', start_seq: 1 });

module.exports = mongoose.model('ContactUs', contactUsSchema);

