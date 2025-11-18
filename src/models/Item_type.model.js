const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const itemTypeSchema = new mongoose.Schema({
  Item_type_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  status: {
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

itemTypeSchema.index({ Item_type_id: 1 });
itemTypeSchema.index({ name: 1 });
itemTypeSchema.index({ status: 1 });

itemTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

itemTypeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

itemTypeSchema.plugin(AutoIncrement, { inc_field: 'Item_type_id', start_seq: 1 });

let ItemTypeModel;
try {
  ItemTypeModel = mongoose.model('Item_type');
} catch (error) {
  ItemTypeModel = mongoose.model('Item_type', itemTypeSchema);
}

module.exports = ItemTypeModel;

