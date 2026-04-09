import express from "express";
const router = express.Router();
import categoryController from "../../controllers/categoryController.js";
import multer from "multer";
const upload = multer();

router.get("/get-all-categories", categoryController.getAllCategories);
router.get("/get-category-tree", categoryController.getCategoryTree);
router.get("/get-category/:id", categoryController.getCategoryById);
router.post("/add-category", categoryController.createCategory);
router.put("/update-category/:id", categoryController.updateCategory);
router.delete("/delete-category/:id", categoryController.deleteCategory);
router.patch("/toggle-status/:id", categoryController.toggleStatus);

export default router;
