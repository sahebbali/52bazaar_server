import { mongoose, Types } from "mongoose";
import path from "path";
import fs from "fs";
const fsPromises = fs.promises;
import Product from "../models/productModel.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getProducts = async (req, res) => {
  try {
    // Destructure with defaults
    let { name, price, categories, page = 1, limit = 10, sort: sortParam } = req.query;
    const query = { is_active: true };

    // Convert to array and validate categories
    const categoryIds = [].concat(categories || []).filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );

    // Pagination setup
    const pagination = { skip: 0, limit: 10 };
    if (limit === "all" || limit === 0) {
      pagination.limit = 0;
      page = 1;
    } else {
      pagination.limit = Number(limit) || 10;
      page = Math.max(1, Number(page) || 1);
    }
    pagination.skip = pagination.limit === 0 ? 0 : (page - 1) * pagination.limit;

    // Build filters
    if (name) {
      query.$text = { $search: name };
    }
    if (price && !isNaN(price)) {
      query.price = Number(price);
    }
    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Sorting (enhanced)
    const sort = {};
    if (name) {
      sort.score = { $meta: "textScore" };
    } else if (sortParam) {
      // Handle custom sort params like "price_asc", "name_desc"
      const [field, order] = sortParam.split('_');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default
    }

    // Execute queries
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .select('name price unit quantity imgUrl category')
        .sort(sort)
        .populate("category", "name")
        .lean()
        .skip(pagination.skip)
        .limit(pagination.limit || undefined)
        .maxTimeMS(5000),
    ]);

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages: pagination.limit === 0 ? 1 : Math.ceil(totalProducts / pagination.limit),
      currentPage: page,
      products,
      filters: { // Return active filters
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        ...(categoryIds.length > 0 && { categories: categoryIds })
      }
    });
  } catch (err) {
    console.error(`Product API Error: ${err.message}`, {
      query: req.query,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(500).json({ 
      success: false,
      message: "Failed to fetch products",
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

async function processProductImage(newProduct, file) {
  if (!file) return;

  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, "products");

    // Save the secure URL to your database
    newProduct.imgUrl = result.secure_url;
    newProduct.imgPublicId = result.public_id;
    return await newProduct.save();
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

const addProduct = async (req, res) => {
  try {
    const { name, price, unit, quantity, category } = req.body;

    // Check if product already exists within the category
    const existingProduct = await Product.findOne({
      name: name.trim(),
      category,
      is_active: true,
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with the same name already exists in this category",
      });
    }

    const newProduct = new Product({ name, price, unit, quantity, category });

    await newProduct.save();

    // Process image upload separately
    setImmediate(async () => {
      if (req.file) await processProductImage(newProduct, req.file);
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Failed to save product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, category, unit, quantity } = req.body;
    const productId = req.params.id;

    // Check for duplicate product name in same category (exclude self)
    const existingProduct = await Product.findOne({
      _id: { $ne: productId },
      name: name.trim(),
      category,
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with the same name already exists in this category",
      });
    }

    // Find current product
    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updatedData = { name, price, category, unit, quantity };

    // If a new image is uploaded
    if (req.file) {
      // 1. Delete old image from Cloudinary
      if (product.imgPublicId) {
        await deleteFromCloudinary(product.imgPublicId);
      }

      // 2. Upload new image to Cloudinary
      const uploaded = await uploadToCloudinary(req.file.buffer, "products");

      updatedData.imgUrl = uploaded.secure_url;
      updatedData.imgPublicId = uploaded.public_id;
    }

    // 3. Update product in DB
    const updated = await Product.findByIdAndUpdate(productId, updatedData, {
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

const deactivateProduct = async (req, res) => {
  try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
          return res.status(404).json({ success: false, message: 'Category not found' });
      }

      product.is_active = false; // assuming you have an `is_active` field
      await product.save();

      return res.json({ success: true, message: 'Product removed successfully.' });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default { getProducts, addProduct, updateProduct, deactivateProduct };
