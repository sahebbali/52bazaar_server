import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

const getAllCategories = async (req, res) => {
  try {
    // console.log("Fetching all categories...");
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

const getAllProducts = async (req, res) => {
  console.log("Fetching all products...");
  try {
    const {
      category,
      page = 1,
      limit = 20,
      sort = "name",
      order = "asc",
      minPrice,
      maxPrice,
      minRating,
      inStock,
      search,
    } = req.query;

    // 🔹 Build filter
    const filter = {
      is_active: true,
    };

    // 🔹 Category filter (case-insensitive exact match)
    if (category) {
      filter.category = {
        $regex: new RegExp(`^${category}$`, "i"),
      };
    }

    // 🔹 Search filter (name-based search)
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // 🔹 Price filter
    if (minPrice || maxPrice) {
      filter.regularPrice = {};
      if (minPrice) filter.regularPrice.$gte = Number(minPrice);
      if (maxPrice) filter.regularPrice.$lte = Number(maxPrice);
    }

    // 🔹 Rating filter
    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // 🔹 Stock filter
    if (inStock === "true") {
      filter.stockQuantity = { $gt: 0 };
    }

    // 🔹 Sorting
    const sortObj = {
      [sort]: order === "desc" ? -1 : 1,
    };

    // 🔹 Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // 🔹 Execute queries
    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export default {
  getAllCategories,
  getAllProducts,
};
