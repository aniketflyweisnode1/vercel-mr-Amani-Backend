const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const platformSchema = new mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Status: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const changesPlatfromsSchema = new mongoose.Schema({
  Changes_Platfroms_id: {
    type: Number,
    unique: true
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Platform: {
    type: [platformSchema],
    default: []
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

changesPlatfromsSchema.index({ Changes_Platfroms_id: 1 });
changesPlatfromsSchema.index({ Branch_id: 1 });
changesPlatfromsSchema.index({ Status: 1 });

changesPlatfromsSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

changesPlatfromsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let ChangesPlatfromsModel;
try {
  ChangesPlatfromsModel = mongoose.model('Changes_Platfroms');
} catch (error) {
  changesPlatfromsSchema.plugin(AutoIncrement, { inc_field: 'Changes_Platfroms_id', start_seq: 1 });
  ChangesPlatfromsModel = mongoose.model('Changes_Platfroms', changesPlatfromsSchema);
}

module.exports = ChangesPlatfromsModel;
