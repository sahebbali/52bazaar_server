import { Types, mongoose } from "mongoose";
import Category from "../models/categoryModel.js";

// Helper function to transform category for frontend
const transformCategory = (category) => {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    parent: category.parent_id?.toString() || "",
    status: category.is_active ? "active" : "inactive",
    icon: category.icon || "🗂️",
    metaTitle: category.meta_title || "",
    metaDesc: category.meta_description || "",
    createdAt: category.created_at
      ? new Date(category.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    level: category.level,
    path: category.path,
    products: 0, // You can add product count query here if needed
  };
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const filter = includeInactive === "true" ? {} : { is_active: true };

    const categories = await Category.find(filter)
      .populate("parent", "name")
      .sort({ level: 1, name: 1 })
      .lean();

    const transformed = categories.map(transformCategory);

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category tree (hierarchical)
const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true }).lean();

    // Build tree structure
    const categoryMap = {};
    const roots = [];

    categories.forEach((category) => {
      categoryMap[category._id] = {
        ...transformCategory(category),
        children: [],
      };
    });

    categories.forEach((category) => {
      if (category.parent_id) {
        const parentId = category.parent_id.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryMap[category._id]);
        } else {
          roots.push(categoryMap[category._id]);
        }
      } else {
        roots.push(categoryMap[category._id]);
      }
    });

    res.json(roots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id)
      .populate("parent", "name")
      .lean();

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(transformCategory(category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      parent,
      status,
      icon,
      metaTitle,
      metaDesc,
    } = req.body;

    // console.log("Received category data:", req.body); // Debug log

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ error: "Category with this name already exists" });
    }

    // Check if slug is unique
    if (slug) {
      const existingSlug = await Category.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    // Validate parent category if provided
    if (parent) {
      if (!(Number.isInteger(parent) && parent > 0)) {
        return res.status(400).json({ error: "Invalid parent category ID" });
      }

      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ error: "Parent category not found" });
      }
    }

    const category = await Category.create({
      name,
      slug: slug || undefined,
      description: description || "",
      parent_id: parent || null,
      is_active: status === "active",
      icon: icon || "🗂️",
      meta_title: metaTitle || "",
      meta_description: metaDesc || "",
    });

    res.status(201).json({
      message: "Category created successfully",
      data: transformCategory(category),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Duplicate key error. Name or slug already exists." });
    }
    console.error("Error creating category:", error); // Debug log
    res.status(500).json({ error: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const {
      id,
      name,
      slug,
      description,
      parent,
      status,
      icon,
      metaTitle,
      metaDesc,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if updating to a parent that would create a circular reference
    // if (parent) {
    //   if (!mongoose.Types.ObjectId.isValid(parent)) {
    //     return res.status(400).json({ error: "Invalid parent category ID" });
    //   }

    //   if (parent === id) {
    //     return res
    //       .status(400)
    //       .json({ error: "Category cannot be its own parent" });
    //   }

    //   // Check for circular reference
    //   let currentParent = await Category.findById(parent);
    //   while (currentParent && currentParent.parent_id) {
    //     if (currentParent.parent_id.toString() === id) {
    //       return res.status(400).json({ error: "Circular reference detected" });
    //     }
    //     currentParent = await Category.findById(currentParent.parent_id);
    //   }
    // }

    // Check name uniqueness
    if (name && name !== existingCategory.name) {
      const nameExists = await Category.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(400).json({ error: "Category name already exists" });
      }
    }

    // Check slug uniqueness
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await Category.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description:
          description !== undefined
            ? description
            : existingCategory.description,
        parent_id:
          parent !== undefined ? parent || null : existingCategory.parent_id,
        is_active:
          status !== undefined
            ? status === "active"
            : existingCategory.is_active,
        icon: icon || existingCategory.icon,
        meta_title:
          metaTitle !== undefined ? metaTitle : existingCategory.meta_title,
        meta_description:
          metaDesc !== undefined ? metaDesc : existingCategory.meta_description,
      },
      { new: true, runValidators: true },
    )
      .populate("parent", "name")
      .lean();

    res.json(transformCategory(updated));
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "Duplicate key error. Name or slug already exists." });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Attempting to delete category with ID:", id); // Debug log

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // Check if category has children
    // const children = await Category.find({ parent_id: id });
    // if (children.length > 0) {
    //   return res.status(400).json({
    //     error:
    //       "Cannot delete category with subcategories. Move or delete children first.",
    //   });
    // }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: error.message });
  }
};

// Toggle category status (active/inactive)
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.is_active = !category.is_active;
    await category.save();

    res.json({
      message: `Category ${
        category.is_active ? "activated" : "deactivated"
      } successfully`,
      status: category.is_active ? "active" : "inactive",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleStatus,
};
