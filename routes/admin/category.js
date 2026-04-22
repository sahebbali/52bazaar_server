import express from "express";
const router = express.Router();
import categoryController from "../../controllers/categoryController.js";
import multer from "multer";
import { handleUpload } from "../../utils/uploadMiddleware.js";
import { upload } from "../../utils/cloudinary.js";

router.get("/get-all-categories", categoryController.getAllCategories);
router.get("/get-category-tree", categoryController.getCategoryTree);
router.get("/get-category/:id", categoryController.getCategoryById);
router.post(
  "/add-category",
  (req, res, next) => {
    upload.array("images", 20)(req, res, function (err) {
      if (err) {
        console.log("route err", err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  categoryController.createCategory,
);
router.put("/update-category", categoryController.updateCategory);
router.delete("/delete-category/:id", categoryController.deleteCategory);
router.patch("/toggle-status/:id", categoryController.toggleStatus);

export default router;
