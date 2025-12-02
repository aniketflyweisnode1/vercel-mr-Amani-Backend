const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringEventTypeSchema = new mongoose.Schema({
  Catering_EventType_id: {
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

cateringEventTypeSchema.index({ Catering_EventType_id: 1 });
cateringEventTypeSchema.index({ name: 1 });
cateringEventTypeSchema.index({ Status: 1 });

cateringEventTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let CateringEventTypeModel;
try {
  CateringEventTypeModel = mongoose.model('Catering_EventType');
} catch (error) {
  cateringEventTypeSchema.plugin(AutoIncrement, { inc_field: 'Catering_EventType_id', start_seq: 1 });
  CateringEventTypeModel = mongoose.model('Catering_EventType', cateringEventTypeSchema);
}

module.exports = CateringEventTypeModel;

