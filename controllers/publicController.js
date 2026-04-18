import Category from "../models/categoryModel.js";

const getAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories...");
    const filter = { is_active: true };

    const categories = await Category.find(filter)
      .select("name icon subcategories parent_id level")
      .sort({ created_at: -1 })
      .lean();

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllCategories,
};
