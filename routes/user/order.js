// routes/order.js
import express from "express";
const router = express.Router();

import orderController from "../../controllers/orderController.js";
import couponController from "../../controllers/couponController.js";

router.get("/get-my-orders", orderController.getMyOrders);
// router.get("/orders/:id", orderController.getOrderDetails);
router.post("/place-order", orderController.createOrder);
router.put("/cancel-order/:id", orderController.cancelOrder);
// coupon routes
router.put("/validate-coupon", couponController.validateCoupon);
router.post("/apply-to-order", couponController.applyCouponToOrder);
router.get("/get-valid-coupons", couponController.getValidCoupons);

// router.get("/my-orders", authMiddleware, async (req, res) => {
//   const orders = await Order.find({ user: req.user._id }).populate(
//     "items.product",
//   );
//   res.json(orders);
// });

export default router;
