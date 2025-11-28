const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantItemCategorySchema = new mongoose.Schema({
  Restaurant_item_Category_id: {
    type: Number,
    unique: true
  },
  CategoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [150, 'Category name cannot exceed 150 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
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

restaurantItemCategorySchema.index({ Restaurant_item_Category_id: 1 });
restaurantItemCategorySchema.index({ CategoryName: 1 });
restaurantItemCategorySchema.index({ Status: 1 });

restaurantItemCategorySchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantItemCategorySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

let RestaurantItemCategoryModel;
try {
  RestaurantItemCategoryModel = mongoose.model('Restaurant_item_Category');
} catch (error) {
  restaurantItemCategorySchema.plugin(AutoIncrement, { inc_field: 'Restaurant_item_Category_id', start_seq: 1 });
  RestaurantItemCategoryModel = mongoose.model('Restaurant_item_Category', restaurantItemCategorySchema);
}

module.exports = RestaurantItemCategoryModel;


