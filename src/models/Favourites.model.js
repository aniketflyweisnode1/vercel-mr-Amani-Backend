const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const favouritesSchema = new mongoose.Schema({
  Favourites_id: {
    type: Number,
    unique: true
  },
  items: {
    type: [Number],
    ref: 'Item',
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(id => Number.isInteger(id) && id > 0);
      },
      message: 'Items must be an array of positive integers'
    }
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  business_Branch_id: {
    type: Number,
    ref: 'Business_Branch',
    required: [true, 'Business branch ID is required']
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

favouritesSchema.index({ Favourites_id: 1 });
favouritesSchema.index({ business_Branch_id: 1 });
favouritesSchema.index({ items: 1 });
favouritesSchema.index({ Status: 1 });
favouritesSchema.index({ created_by: 1 });

favouritesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

favouritesSchema.plugin(AutoIncrement, { inc_field: 'Favourites_id', start_seq: 1 });

module.exports = mongoose.model('Favourites', favouritesSchema);

