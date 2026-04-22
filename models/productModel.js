import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

// Review schema for product ratings
const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true, // ✅ Added required
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    // 💰 Pricing (Updated to match your data)
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      // ✅ NEW: To store original price before discount
      type: Number,
      min: 0,
    },

    cost: {
      type: Number,
      min: 0,
    },

    // ⭐ Ratings & Reviews (✅ NEW)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviewDetails: {
      type: [reviewSchema],
      default: [],
    },

    // 📦 Inventory
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    unit: {
      type: String,
      trim: true,
    },

    // ⚖️ Physical
    weight: {
      type: Number,
    },

    dimensions: {
      type: String,
    },

    // 🏷️ Tags
    tags: {
      type: [String],
      default: [],
    },

    // 🖼️ Images (Updated to handle single image URL)
    images: {
      type: [imageSchema],
      default: [],
    },

    // ✅ NEW: Direct image URL field for simpler storage
    imageUrl: {
      type: String,
      trim: true,
    },

    // 🔍 SEO
    metaTitle: {
      type: String,
      trim: true,
    },

    metaDescription: {
      type: String,
      trim: true,
    },

    // 📊 Status
    is_active: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    reason: {
      type: [],
      trim: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// 🔎 Indexing
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ is_active: 1 });
productSchema.index({ regularPrice: 1 });
productSchema.index({ rating: -1 }); // ✅ For sorting by rating

const Product = mongoose.model("Product", productSchema);

export default Product;
