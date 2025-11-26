const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantWebsiteTemplateSchema = new mongoose.Schema({
  Restaurant_website_Template_id: {
    type: Number,
    unique: true
  },
  TempleteName: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [150, 'Template name cannot exceed 150 characters']
  },
  Description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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

restaurantWebsiteTemplateSchema.index({ Restaurant_website_Template_id: 1 });
restaurantWebsiteTemplateSchema.index({ TempleteName: 1 });
restaurantWebsiteTemplateSchema.index({ Status: 1 });

restaurantWebsiteTemplateSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

restaurantWebsiteTemplateSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});

restaurantWebsiteTemplateSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_website_Template_id', start_seq: 1 });

module.exports = mongoose.model('Restaurant_website_Template', restaurantWebsiteTemplateSchema);


