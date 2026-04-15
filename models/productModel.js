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
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    // 💰 Pricing
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          return !value || value <= this.regularPrice;
        },
        message: "Sale price must be less than regular price",
      },
    },

    cost: {
      type: Number,
      min: 0,
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

    // 🖼️ Images (MULTIPLE)
    images: {
      type: [imageSchema],
      default: [],
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
productSchema.index({ price: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
