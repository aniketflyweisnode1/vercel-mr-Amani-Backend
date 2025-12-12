const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const recentAcitvitysSchema = new mongoose.Schema({
  RecentAcitvitys_id: {
    type: Number,
    unique: true
  },
  Vender_store_id: {
    type: Number,
    ref: 'Vendor_Store',
    required: [true, 'Vendor store ID is required']
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: [50, 'Emoji cannot exceed 50 characters']
  },
  AcitivityText: {
    type: String,
    trim: true,
    maxlength: [500, 'Activity text cannot exceed 500 characters']
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

recentAcitvitysSchema.index({ RecentAcitvitys_id: 1 });
recentAcitvitysSchema.index({ Vender_store_id: 1 });
recentAcitvitysSchema.index({ Status: 1 });

recentAcitvitysSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

recentAcitvitysSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let RecentAcitvitysModel;
try {
  RecentAcitvitysModel = mongoose.model('RecentAcitvitys');
} catch (error) {
  recentAcitvitysSchema.plugin(AutoIncrement, { inc_field: 'RecentAcitvitys_id', start_seq: 1 });
  RecentAcitvitysModel = mongoose.model('RecentAcitvitys', recentAcitvitysSchema);
}

module.exports = RecentAcitvitysModel;
