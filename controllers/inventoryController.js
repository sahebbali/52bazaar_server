import Product from "../models/productModel.js";

const getAllInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      status,
      stockStatus,
    } = req.query;

    const query = {};

    // 🔍 Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // 📂 Category
    if (category) {
      query.category = category; // must be ObjectId
    }

    // 📊 Status
    if (status) {
      query.is_active = status === "active";
    }

    // 📦 Stock Status
    if (stockStatus === "in") {
      query.stockQuantity = { $gt: 10 };
    }
    if (stockStatus === "low") {
      query.stockQuantity = { $gt: 0, $lte: 10 };
    }
    if (stockStatus === "out") {
      query.stockQuantity = 0;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export default {
  getAllInventory,
  getInventoryById,
};
