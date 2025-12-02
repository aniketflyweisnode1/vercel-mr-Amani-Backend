const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringSchema = new mongoose.Schema({
  Catering_id: {
    type: Number,
    unique: true
  },
  Catering_type_id: {
    type: Number,
    ref: 'Catering_Type',
    required: [true, 'Catering Type ID is required']
  },
  Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Branch ID is required']
  },
  Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Reating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  Review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  MinPriceOrder: {
    type: Number,
    min: [0, 'Minimum price order cannot be negative'],
    default: 0
  },
  Tags: {
    type: [String],
    default: []
  },
  CateringImage: {
    type: String,
    trim: true,
    maxlength: [500, 'Catering image path cannot exceed 500 characters']
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

cateringSchema.index({ Catering_id: 1 });
cateringSchema.index({ Catering_type_id: 1 });
cateringSchema.index({ Branch_id: 1 });
cateringSchema.index({ Status: 1 });
cateringSchema.index({ created_by: 1 });

cateringSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let CateringModel;
try {
  CateringModel = mongoose.model('Catering');
} catch (error) {
  cateringSchema.plugin(AutoIncrement, { inc_field: 'Catering_id', start_seq: 1 });
  CateringModel = mongoose.model('Catering', cateringSchema);
}

module.exports = CateringModel;

