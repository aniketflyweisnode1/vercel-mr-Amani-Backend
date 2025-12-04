const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const groceryCategoriesSchema = new mongoose.Schema({
  Grocery_Categories_id: {
    type: Number,
    unique: true
  },
  Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  Coverimage: {
    type: String,
    trim: true,
    maxlength: [500, 'Cover image path cannot exceed 500 characters']
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

groceryCategoriesSchema.index({ Grocery_Categories_id: 1 });
groceryCategoriesSchema.index({ Name: 1 });
groceryCategoriesSchema.index({ Status: 1 });

groceryCategoriesSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let GroceryCategoriesModel;
try {
  GroceryCategoriesModel = mongoose.model('Grocery_Categories');
} catch (error) {
  groceryCategoriesSchema.plugin(AutoIncrement, { inc_field: 'Grocery_Categories_id', start_seq: 1 });
  GroceryCategoriesModel = mongoose.model('Grocery_Categories', groceryCategoriesSchema);
}

module.exports = GroceryCategoriesModel;

