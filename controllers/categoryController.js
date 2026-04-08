import { Types } from "mongoose";
import Category from "../models/categoryModel.js";

const getCategories = async (req, res) => {
  try {
    let { name, parent, page = 1, limit = 20 } = req.query;
    const query = { is_active: true };

    const isTextSearch = Boolean(name);

    if (limit === "all" || limit === 0) {
      limit = 0; // MongoDB: 0 means "no limit" (return all)
      page = 1;
    } else {
      limit = Number(limit);
      page = Number(page);
    }

    const skip = limit === 0 ? 0 : (page - 1) * limit;

    // Filters
    if (isTextSearch) {
      query.$text = { $search: name };
    }

    if (name) query.name = { $regex: name, $options: "i" };

    if (parent && Types.ObjectId.isValid(parent))
      query.parent = new Types.ObjectId(parent);

    const projection = {
      name: 1,
      parent: 1,
      ...(isTextSearch && { score: { $meta: "textScore" } }),
    };

    const sort = isTextSearch ? { score: { $meta: "textScore" } } : { name: 1 };

    const [totalCategories, categories] = await Promise.all([
      Category.countDocuments(query),
      Category.find(query)
        .select(projection)
        .sort(sort)
        .populate("parent_id", "name")
        .lean()
        .skip(skip)
        .limit(limit === 0 ? undefined : limit) // ✅ no limit if 0
        .maxTimeMS(5000),
    ]);

    res.status(200).json({
      totalCategories,
      totalPages: limit === 0 ? 1 : Math.ceil(totalCategories / limit), // ✅ prevent division by zero
      currentPage: Number(page),
      categories,
    });
  } catch (err) {
    // Log the actual error message and stack trace
    console.error("Error fetching categories:", err.message);
    console.error(err.stack);

    // Send server error response
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, parent_id, is_active } = req.body;
    // Check for existing product with same name and category
    const existingCategory = await Category.findOne({
      name: name.trim(),
      parent_id,
      is_active: true,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with the same name already exists",
      });
    }

    const newCategory = new Category({
      name,
      parent_id: parent_id || null,
      is_active: is_active ?? true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const saved = await newCategory.save();

    res
      .status(201)
      .json({ success: true, message: "Category added successfully" });
  } catch (error) {
    console.error("Add Category Error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const categoryId = req.params.id;

    // Check for duplicate product name in same category (exclude self)
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      name: name.trim(),
      parent_id,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with the same name already exists in this category",
      });
    }

    // Find current product
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const updatedData = { name, parent_id };

    // 3. Update product in DB
    const updated = await Category.findByIdAndUpdate(categoryId, updatedData, {
      new: true,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

const deactivateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    category.is_active = false; // assuming you have an `is_active` field
    await category.save();

    return res.json({
      success: true,
      message: "Category removed successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default {
  getCategories,
  addCategory,
  updateCategory,
  deactivateCategory,
};
