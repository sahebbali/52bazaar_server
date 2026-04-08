// routes/order.js
import express from 'express';
const router = express.Router();
import Order from '../models/orderModel.js';
import authMiddleware from '../middleware/authMiddleware.js'; // validate token
import orderController from '../controllers/orderController.js'

router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderDetails);
router.post('/place-order', orderController.placeOrder);

router.get('/my-orders', authMiddleware, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
});

export default router;
