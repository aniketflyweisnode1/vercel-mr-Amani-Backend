const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    maxlength: [100, 'Password cannot exceed 100 characters']
  },
  phoneNo: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  isAgreeTermsConditions: {
    type: Boolean,
    default: false
  },
  role_id: {
    type: Number,
    ref: 'Role',
    default: 2
  },
  country_id: {
    type: Number,
    ref: 'Country',
    default: null
  },
  state_id: {
    type: Number,
    ref: 'State',
    default: null
  },
  city_id: {
    type: Number,
    ref: 'City',
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  Islogin_permissions: {
    type: Boolean,
    default: true
  },
  Permissions_DeviceLocation: {
    type: Boolean,
    default: false
  },
  Bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
   // match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  hobby: [{
    type: String,
    trim: true,
    maxlength: [100, 'Each hobby cannot exceed 100 characters']
  }],
  personType: {
    type: String,
    enum: ['Family Person', 'Friends Person', 'Social Person'],
    trim: true
  },
  user_image: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  created_by: {
    type: Number,
    default: null
  },
  created_by_object: {
    type: mongoose.Schema.Types.ObjectId,
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
userSchema.index({ user_id: 1 });
userSchema.index({ phoneNo: 1 });
userSchema.index({ role_id: 1 });
userSchema.index({ status: 1 });
userSchema.index({ Email: 1 });
userSchema.index({ personType: 1 });
userSchema.index({ country_id: 1 });
userSchema.index({ state_id: 1 });
userSchema.index({ city_id: 1 });
userSchema.index({ created_by: 1 });
userSchema.index({ created_by_object: 1 });

// Pre-save middleware to update updated_at timestamp
userSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for user_id
userSchema.plugin(AutoIncrement, { inc_field: 'user_id', start_seq: 1 });

module.exports = mongoose.model('User', userSchema);

