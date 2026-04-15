import Product from "../models/productModel.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$text = { $search: query.search };
  }
  if (query.category) filter.category = query.category;
  if (query.is_active !== undefined)
    filter.is_active = query.is_active === "true";
  if (query.tag) filter.tags = query.tag;

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.regularPrice = {};
    if (query.minPrice) filter.regularPrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.regularPrice.$lte = Number(query.maxPrice);
  }

  // Stock status
  if (query.stockStatus === "out_of_stock") filter.stockQuantity = 0;
  if (query.stockStatus === "low_stock") {
    filter.$expr = { $lte: ["$stockQuantity", "$lowStockThreshold"] };
    filter.stockQuantity = { $gt: 0 };
  }
  if (query.stockStatus === "in_stock") {
    filter.$expr = { $gt: ["$stockQuantity", "$lowStockThreshold"] };
  }

  return filter;
};

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * List products with filtering, sorting, pagination
 */
export const getAllProducts = async (req, res) => {
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
/**
 * GET /api/products/:id
 * Single product by Mongo _id  OR  slug
 */
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("Received id for getProduct:", id);
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    // console.log("Filter for getProduct:", filter);

    const product = await Product.findOne(filter)
      .populate("category", "name slug")
      .lean({ virtuals: true });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/products
 * Create product. Images via multipart/form-data (field: "images").
 * Other fields sent as JSON in "data" field OR as flat form fields.
 */
export const createProduct = async (req, res) => {
  try {
    // console.log("Files received:", req.files);
    // Parse body – support both JSON body and multipart form fields
    let body = req.body;
    // console.log("Raw request body:", body);
    if (typeof body.data === "string") body = JSON.parse(body.data);

    // Parse array/object fields that may arrive as strings from formData
    ["tags"].forEach((key) => {
      if (typeof body[key] === "string") {
        try {
          body[key] = JSON.parse(body[key]);
        } catch {
          body[key] = body[key].split(",").map((s) => s.trim());
        }
      }
    });

    // Build images array from uploaded files
    const uploadedImages = (req.files || []).map((file, idx) => ({
      url: file.path, // Cloudinary secure URL
      publicId: file.filename, // Cloudinary public_id
      isFeatured: idx === 0, // first upload is featured by default
      order: idx,
    }));

    const product = await Product.create({ ...body, images: uploadedImages });
    await product.populate("category", "name slug");

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create product error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res
        .status(409)
        .json({ success: false, message: `${field} already exists` });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/products/:id
 * Full update (non-image fields). Send JSON body.
 */
export const updateProduct = async (req, res) => {
  try {
    const body = req.body;
    // console.log("Update product body:", body);

    const id = body.id; // 👈 get from body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Parse tags
    if (typeof body.tags === "string") {
      body.tags = JSON.parse(body.tags);
    }
    // ✅ Convert numeric fields
    const numberFields = [
      "regularPrice",
      "salePrice",
      "cost",
      "stockQuantity",
      "lowStockThreshold",
      "weight",
    ];

    numberFields.forEach((field) => {
      if (body[field] !== undefined) {
        body[field] = Number(body[field]);
      }
    });

    delete body.images;
    delete body.id; // 👈 prevent updating _id
    console.log("Final update body after processing:", body);

    if (
      body.salePrice !== undefined &&
      body.regularPrice !== undefined &&
      body.salePrice >= body.regularPrice
    ) {
      console.log("Sale price must be less than regular price");
      return res.status(400).json({
        success: false,
        message: "Sale price must be less than regular price",
      });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
/**
 * DELETE /api/products/:id
 * Delete product and all its Cloudinary images
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // Remove all images from Cloudinary
    // await Promise.all(
    //   product.images.map((img) => deleteFromCloudinary(img.publicId)),
    // );

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Image sub-resource controllers ──────────────────────────────────────────

/**
 * POST /api/products/:id/images
 * Upload one or more images to an existing product.
 * multipart/form-data field: "images"
 */
export const addImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (!req.files?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No images provided" });
    }

    const totalAfter = product.images.length + req.files.length;
    if (totalAfter > 20) {
      // Delete the just-uploaded extras from Cloudinary to avoid orphans
      await Promise.all(req.files.map((f) => deleteFromCloudinary(f.filename)));
      return res.status(400).json({
        success: false,
        message: `Cannot exceed 20 images. Current: ${product.images.length}, uploading: ${req.files.length}`,
      });
    }

    const newImages = req.files.map((file, idx) => ({
      url: file.path,
      publicId: file.filename,
      isFeatured: false,
      order: product.images.length + idx,
    }));

    // Auto-feature if product had no images
    if (product.images.length === 0 && newImages.length > 0) {
      newImages[0].isFeatured = true;
    }

    product.images.push(...newImages);
    await product.save();
    await product.populate("category", "name slug");

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/products/:id/images/:imageId
 * Remove a single image from a product
 */
export const removeImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const imgIndex = product.images.findIndex(
      (img) => img._id.toString() === req.params.imageId,
    );
    if (imgIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    const [removed] = product.images.splice(imgIndex, 1);
    await deleteFromCloudinary(removed.publicId);

    // If removed image was featured, promote next available
    if (removed.isFeatured && product.images.length > 0) {
      product.images[0].isFeatured = true;
    }

    await product.save();
    await product.populate("category", "name slug");

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/products/:id/images/:imageId/featured
 * Set an image as the featured image for the product
 */
export const setFeaturedImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    let found = false;
    product.images.forEach((img) => {
      if (img._id.toString() === req.params.imageId) {
        img.isFeatured = true;
        found = true;
      } else {
        img.isFeatured = false;
      }
    });

    if (!found)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    await product.save();
    await product.populate("category", "name slug");

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/products/:id/images/reorder
 * Body: { order: ["imageId1", "imageId2", ...] }
 * Re-order images by providing a sorted list of image _ids
 */
export const reorderImages = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({
        success: false,
        message: "`order` must be an array of image ids",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const imageMap = new Map(
      product.images.map((img) => [img._id.toString(), img]),
    );

    const reordered = order
      .map((imgId, idx) => {
        const img = imageMap.get(imgId);
        if (img) img.order = idx;
        return img;
      })
      .filter(Boolean);

    if (reordered.length !== product.images.length) {
      return res.status(400).json({
        success: false,
        message: "Image id list does not match product images",
      });
    }

    product.images = reordered;
    await product.save();
    await product.populate("category", "name slug");

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/products/:id/toggle-status
 * Toggle is_active
 */
export const toggleStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    product.is_active = !product.is_active;
    await product.save();

    res.status(200).json({
      success: true,
      data: { _id: product._id, is_active: product.is_active },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
