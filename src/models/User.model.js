const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');
const { generateUniqueReferralCode } = require('../../utils/referralCode');

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    unique: true
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  BusinessName: {
    type: String,
    trim: true,
    maxlength: [150, 'Business name cannot exceed 150 characters']
  },
  password: {
    type: String,
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
  RegistrationType: {
    type: String,
    enum: ['Individual', 'Company'],
    default: 'Individual',
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
  ReferralCode: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    length: [10, 'Referral code must be exactly 10 characters'],
    match: [/^[A-Z0-9]{10}$/, 'Referral code must contain only uppercase letters and numbers']
  },
  invitedBy: {
    type: Number,
    ref: 'User',
    default: null
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
userSchema.index({ user_id: 1 });
userSchema.index({ phoneNo: 1 });
userSchema.index({ role_id: 1 });
userSchema.index({ status: 1 });
userSchema.index({ Email: 1 });
userSchema.index({ personType: 1 });
userSchema.index({ RegistrationType: 1 });
userSchema.index({ BusinessName: 1 });
userSchema.index({ ReferralCode: 1 });
userSchema.index({ invitedBy: 1 });

// Pre-save middleware to hash password, update updated_at timestamp and generate referral code
userSchema.pre('save', async function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  
  // Hash password if it's modified
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate referral code for new users if not already set
  if (this.isNew && !this.ReferralCode) {
    try {
      // Use this.constructor to get the model without circular dependency
      this.ReferralCode = await generateUniqueReferralCode(this.constructor);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

let UserModel;
try {
  UserModel = mongoose.model('User');
} catch (error) {
  // Auto-increment plugin for user_id - only apply if model doesn't exist
  userSchema.plugin(AutoIncrement, { inc_field: 'user_id', start_seq: 1 });
  UserModel = mongoose.model('User', userSchema);
}

module.exports = UserModel;

