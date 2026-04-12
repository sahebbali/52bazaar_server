import express from "express";

import { upload } from "../../utils/cloudinary.js";
import {
  addImages,
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  removeImage,
  reorderImages,
  setFeaturedImage,
  toggleStatus,
  updateProduct,
} from "../../controllers/productController.js";

const router = express.Router();

// ─── Product CRUD ─────────────────────────────────────────────────────────────
router.get("/", getProducts); // GET    /api/products
router.get("/:id", getProduct); // GET    /api/products/:id  (id OR slug)
router.post(
  "/add-product",
  (req, res, next) => {
    upload.array("images", 20)(req, res, function (err) {
      if (err) {
        console.log("route err", err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  createProduct,
);
router.put("/:id", updateProduct); // PUT    /api/products/:id
router.delete("/:id", deleteProduct); // DELETE /api/products/:id

// ─── Image sub-resource ───────────────────────────────────────────────────────
router.post("/:id/images", upload.array("images", 20), addImages); // POST   /api/products/:id/images
router.delete("/:id/images/:imageId", removeImage); // DELETE /api/products/:id/images/:imageId
router.patch("/:id/images/:imageId/featured", setFeaturedImage); // PATCH  /api/products/:id/images/:imageId/featured
router.patch("/:id/images/reorder", reorderImages); // PATCH  /api/products/:id/images/reorder

// ─── Misc ─────────────────────────────────────────────────────────────────────
router.patch("/:id/toggle-status", toggleStatus); // PATCH  /api/products/:id/toggle-status

export default router;
