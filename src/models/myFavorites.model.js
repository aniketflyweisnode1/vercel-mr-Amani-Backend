const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const myFavoritesSchema = new mongoose.Schema({
  MyFavorites_id: {
    type: Number,
    unique: true
  },
  Item_id: {
    type: Number,
    ref: 'Restaurant_Items',
    required: [true, 'Item ID is required']
  },
  User_Id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
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

// Index for better query performance
myFavoritesSchema.index({ MyFavorites_id: 1 });
myFavoritesSchema.index({ Item_id: 1 });
myFavoritesSchema.index({ User_Id: 1 });
myFavoritesSchema.index({ Status: 1 });
myFavoritesSchema.index({ User_Id: 1, Item_id: 1 }); // Compound index for unique user-item combination

// Pre-save middleware to update updated_at timestamp
myFavoritesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

// Auto-increment plugin for MyFavorites_id
let MyFavoritesModel;
try {
  MyFavoritesModel = mongoose.model('MyFavorites');
} catch (error) {
  myFavoritesSchema.plugin(AutoIncrement, { inc_field: 'MyFavorites_id', start_seq: 1 });
  MyFavoritesModel = mongoose.model('MyFavorites', myFavoritesSchema);
}

module.exports = MyFavoritesModel;
