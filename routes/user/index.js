import express from "express";
import { verifyJWT, verifyUser } from "../../middleware/authMiddleware.js";

import orderRoutes from "./order.js";

const router = express.Router();
const middleware = [verifyJWT, verifyUser];
router.use(middleware);

router.use(orderRoutes);

export default router;
