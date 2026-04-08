import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 2,
    maxlength: 50,
    index: true
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  path: {
    type: String,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    index: true
  },
  // Optional SEO fields
  slug: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  meta_title: String,
  meta_description: String
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
});

// Indexes
categorySchema.index({ name: "text" });
categorySchema.index({ is_active: 1, parent_id: 1 });
categorySchema.index({ path: 1, is_active: 1 });
categorySchema.index({ level: 1, is_active: 1 });

// Virtuals
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id',
  justOne: false
});

categorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parent_id',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook for hierarchy management
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent_id')) {
    if (this.parent_id) {
      const parent = await Category.findById(this.parent_id);
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path},${this._id}` : `${parent._id},${this._id}`;
    } else {
      this.level = 0;
      this.path = this._id.toString();
    }
  }
  
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;