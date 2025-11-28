const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userAddressSchema = new mongoose.Schema({
  User_Address_id: {
    type: Number,
    unique: true
  },
  GoogleAddress: {
    type: String,
    trim: true,
    maxlength: [1000, 'Google address cannot exceed 1000 characters']
  },
  Address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  setDefult: {
    type: Boolean,
    default: false
  },
  City: {
    type: Number,
    ref: 'City',
    default: null
  },
  State: {
    type: Number,
    ref: 'State',
    default: null
  },
  Country: {
    type: Number,
    ref: 'Country',
    default: null
  },
  zipcode: {
    type: String,
    trim: true,
    maxlength: [20, 'Zip code cannot exceed 20 characters']
  },
  user_id: {
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

// Index for better query performance
userAddressSchema.index({ User_Address_id: 1 });
userAddressSchema.index({ user_id: 1 });
userAddressSchema.index({ Status: 1 });
userAddressSchema.index({ setDefult: 1 });
userAddressSchema.index({ City: 1 });
userAddressSchema.index({ State: 1 });
userAddressSchema.index({ Country: 1 });

// Pre-save middleware to update updated_at timestamp
userAddressSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for User_Address_id
userAddressSchema.plugin(AutoIncrement, { inc_field: 'User_Address_id', start_seq: 1 });

module.exports = mongoose.model('User_Address', userAddressSchema);

