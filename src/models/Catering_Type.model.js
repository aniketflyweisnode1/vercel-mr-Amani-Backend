const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringTypeSchema = new mongoose.Schema({
  Catering_Type_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
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

cateringTypeSchema.index({ Catering_Type_id: 1 });
cateringTypeSchema.index({ name: 1 });
cateringTypeSchema.index({ Status: 1 });

cateringTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let CateringTypeModel;
try {
  CateringTypeModel = mongoose.model('Catering_Type');
} catch (error) {
  cateringTypeSchema.plugin(AutoIncrement, { inc_field: 'Catering_Type_id', start_seq: 1 });
  CateringTypeModel = mongoose.model('Catering_Type', cateringTypeSchema);
}

module.exports = CateringTypeModel;

