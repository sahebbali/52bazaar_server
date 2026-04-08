import mongoose from 'mongoose';
import './categoryModel.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be a positive number'],
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  imgUrl: {
    type: String,
    default: null,
    trim: true,
  },
  imgPublicId: {
    type: String,
    default: null,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  autoIndex: true, // Ensure indexes are created automatically
  minimize: false, // Prevent Mongoose from minimizing the schema
  toJSON: { virtuals: true }, // If you use virtuals
  toObject: { virtuals: true },
  id: false // Disable the redundant id virtual
});

productSchema.index({ name: 1 }); // Single field index for name
productSchema.index({ category: 1, is_active: 1 }); // For category filtering
productSchema.index({ price: 1 }); // For price filtering
productSchema.index({ is_active: 1 }); // For active products filter
productSchema.index({ name: "text", category: 1, is_active: 1 }); // Compound text index

const Product = mongoose.model('Product', productSchema);

export default Product;
