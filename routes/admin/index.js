import express from "express";
import { verifyJWT, verifyAdmin } from "../../middleware/authMiddleware.js";
import categoryRoutes from "./category.js";
import productRoutes from "./product.js";

const router = express.Router();
const middleware = [verifyJWT, verifyAdmin];
router.use(middleware);
router.use(categoryRoutes);
router.use(productRoutes);

export default router;
