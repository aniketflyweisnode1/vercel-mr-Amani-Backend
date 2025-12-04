const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const groceryCategoriesTypeSchema = new mongoose.Schema({
  Grocery_Categories_type_id: {
    type: Number,
    unique: true
  },
  Grocery_Categories_id: {
    type: Number,
    ref: 'Grocery_Categories',
    required: [true, 'Grocery Categories ID is required']
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

groceryCategoriesTypeSchema.index({ Grocery_Categories_type_id: 1 });
groceryCategoriesTypeSchema.index({ Grocery_Categories_id: 1 });
groceryCategoriesTypeSchema.index({ Name: 1 });
groceryCategoriesTypeSchema.index({ Status: 1 });

groceryCategoriesTypeSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

let GroceryCategoriesTypeModel;
try {
  GroceryCategoriesTypeModel = mongoose.model('Grocery_Categories_type');
} catch (error) {
  groceryCategoriesTypeSchema.plugin(AutoIncrement, { inc_field: 'Grocery_Categories_type_id', start_seq: 1 });
  GroceryCategoriesTypeModel = mongoose.model('Grocery_Categories_type', groceryCategoriesTypeSchema);
}

module.exports = GroceryCategoriesTypeModel;

