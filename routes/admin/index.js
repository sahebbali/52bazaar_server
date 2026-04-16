import express from "express";
import { verifyJWT, verifyAdmin } from "../../middleware/authMiddleware.js";
import categoryRoutes from "./category.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
import inventoryRoutes from "./inventory.js";
import paymentRoutes from "./payment.js";
import customerRoutes from "./customer.js";

const router = express.Router();
const middleware = [verifyJWT, verifyAdmin];
router.use(middleware);
router.use(categoryRoutes);
router.use(inventoryRoutes);
router.use(orderRoutes);
router.use(productRoutes);
router.use(paymentRoutes);
router.use(customerRoutes);

export default router;
