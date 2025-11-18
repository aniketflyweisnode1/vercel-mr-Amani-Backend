const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const myFavoritesSchema = new mongoose.Schema({
  myFavorites_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  service_id: {
    type: Number,
    ref: 'Services',
    required: [true, 'Service ID is required']
  },
  Item_id: {
    type: Number,
    ref: 'Item',
    required: [true, 'Item ID is required']
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

myFavoritesSchema.index({ myFavorites_id: 1 });
myFavoritesSchema.index({ user_id: 1 });
myFavoritesSchema.index({ service_id: 1 });
myFavoritesSchema.index({ Item_id: 1 });
myFavoritesSchema.index({ status: 1 });

myFavoritesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

myFavoritesSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

myFavoritesSchema.plugin(AutoIncrement, { inc_field: 'myFavorites_id', start_seq: 1 });

let MyFavoritesModel;
try {
  MyFavoritesModel = mongoose.model('myFavorites');
} catch (error) {
  MyFavoritesModel = mongoose.model('myFavorites', myFavoritesSchema);
}

module.exports = MyFavoritesModel;

