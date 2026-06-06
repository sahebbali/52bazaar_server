import mongoose from "mongoose";
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    icon: {
      type: String,
      default: "🗂️",
    },
    parent: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    path: {
      type: String,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    meta_title: {
      type: String,
      maxlength: 60,
    },
    meta_description: {
      type: String,
      maxlength: 160,
    },
    subcategories: [],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

// Indexes
categorySchema.index({ name: "text" });
categorySchema.index({ is_active: 1 });
categorySchema.index({ path: 1, is_active: 1 });
categorySchema.index({ level: 1, is_active: 1 });

// Pre-save hook for hierarchy management
categorySchema.pre("save", async function (next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }

  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
