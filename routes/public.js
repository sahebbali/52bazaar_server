import express from "express";
const router = express.Router();
import upload from "../middleware/upload.js";
import publicController from "../controllers/publicController.js";

// router.get("/products", publicController.getProducts);
router.get("/get-all-categories", publicController.getAllCategories);

export default router;
