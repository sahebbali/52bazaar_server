import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ is_active: true })
      .select("name icon subcategories parent_id level")
      .sort({ created_at: 1 }) // Ascending order
      .lean();

    if (!categories.length) {
      return res.status(404).json({
        message: "No categories found",
      });
    }

    const categoryMap = {};

    // Create category map
    categories.forEach((category) => {
      category.children = [];
      categoryMap[category._id.toString()] = category;
    });

    const rootCategories = [];

    categories.forEach((category) => {
      if (category.parent_id) {
        const parentId = category.parent_id.toString();

        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    res.status(200).json(rootCategories);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  // console.log("Fetching all products...");
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
    console.log("Query parameters:", req.query);

    // 🔹 Category filter (case-insensitive exact match)
    if (category) {
      if (category.toLowerCase() === "all") {
        filter.category = { $in: [null, ""] };
      }
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

const getProductList = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort = "name",
      order = "asc",
      page = 1,
      limit = 12,
    } = req.query;

    // Build query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.regularPrice = {};
      if (minPrice !== undefined)
        query.regularPrice.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined)
        query.regularPrice.$lte = parseFloat(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (inStock === "true") {
      query.stockQuantity = { $gt: 0 };
    }

    query.is_active = true;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [sort]: sortOrder };

    // Execute queries
    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Product.countDocuments(query),
    ]);

    // Get category counts for filters
    const categoryCounts = await Product.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const categories = categoryCounts.map((cat) => ({
      id: cat._id,
      label: cat._id,
      count: cat.count,
    }));
    console.log("Categories with counts:", categories);

    res.json({
      success: true,
      data: products,
      totalCount,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCategoryOfChild = async (req, res) => {
  try {
    const { name } = req.params;

    // 1. Find category by name
    const category = await Category.findOne({
      name,
      is_active: true,
    }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // CASE 1: If it is a PARENT (has children)
    const children = await Category.find({
      parent_id: category._id,
      is_active: true,
    })
      .select("name icon parent_id level subcategories")
      .sort({ name: 1 })
      .lean();

    if (children.length > 0) {
      return res.status(200).json({
        success: true,
        type: "parent",
        category: {
          _id: category._id,
          name: category.name,
          icon: category.icon,
        },
        children,
      });
    }

    // CASE 2: If it is a CHILD → find parent
    if (category.parent_id) {
      const parent = await Category.findById(category.parent_id)
        .select("name icon")
        .lean();

      const siblings = await Category.find({
        parent_id: category.parent_id,
        is_active: true,
      })
        .select("name icon parent_id level subcategories")
        .sort({ name: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        type: "child",
        selected: {
          _id: category._id,
          name: category.name,
          icon: category.icon,
        },
        parent,
        siblings,
      });
    }

    // CASE 3: standalone (no parent, no children)
    return res.status(200).json({
      success: true,
      type: "standalone",
      category,
      children: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getValidCoupons = async (req, res) => {
  try {
    const now = new Date();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {
      isActive: true,
      startDate: { $lte: now }, // already started
      endDate: { $gte: now }, // not expired
    };

    // Search by coupon code
    if (req.query.search) {
      query.code = { $regex: req.query.search, $options: "i" };
    }

    const coupons = await Coupon.find(query)
      .select(
        "-updatedAt -createdAt -usedCount -isActive -applicableProducts -applicableCategories -usageLimit -usedBy -createdBy",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Valid coupons fetched successfully",
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export default {
  getAllCategories,
  getAllProducts,
  getProductList,
  getCategoryOfChild,
  getValidCoupons,
};
