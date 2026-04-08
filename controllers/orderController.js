import { Types }   from 'mongoose';
import bcrypt from 'bcryptjs';
import Order    from '../models/orderModel.js';
import User    from '../models/userModel.js';

const placeOrder = async (req, res) => {

    // Validate required fields
    const requiredFields = [
        'customerInfo',  // Should contain email or phone
        'paymentMethod',
        'items',
        'total'
    ];
    
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ 
                success: false,
                message: `Missing required field: ${field}` 
            });
        }
    }

    try {
        const { customerInfo, paymentMethod, items, total } = req.body;
                
        // Validate items array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart items are invalid'
            });
        }

        // Validate total is a positive number
        if (typeof total !== 'number' || total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total amount is invalid'
            });
        }

        // Check if customer exists by email or phone
        let customer = await User.findOne({
            $or: [
                { email: customerInfo.email },
                { phone: customerInfo.phone }
            ]
        });

        // If customer doesn't exist, create new customer
        if (!customer) {
            customer = new User({
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                password: await bcrypt.hash('temporaryPassword', 10), // Set a temporary password
                addresses: [{
                    name: customerInfo.shippingName || customerInfo.name,
                    phone: customerInfo.shippingPhone || customerInfo.phone,
                    street: customerInfo.street,
                    city: customerInfo.city,
                    isDefault: true
                }]
            });
            await customer.save();
        }

        // Create order with customer reference
        const order = new Order({
            user: customer._id,  // Reference to customer
            items: items.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                priceAtPurchase: item.price,
                name: item.name
            })),
            totalAmount: total,
            shippingAddress: {
                name: customerInfo.shippingName || customerInfo.name,
                phone: customerInfo.shippingPhone || customerInfo.phone,
                street: customerInfo.street,
                city: customerInfo.city,
                additionalInfo: customerInfo.additionalInfo
            },
            paymentMethod,
            status: 'pending'
        });

        await order.save();

        res.status(200).json({ 
            success: true,
            orderId: order._id,
            customerId: customer._id,
            message: 'Order placed successfully'
        });

    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
    
};

const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const [totalOrders, orders] = await Promise.all([
            Order.countDocuments(),
            Order.find()
                .select("paymentMethod shippingAddress.name shippingAddress.street shippingAddress.city user") // ✅ only required fields
                .populate("user", "name") // ✅ get customer name
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .lean()
        ]);

        console.log(orders);

        // Transforming for frontend clarity
        const formattedOrders = orders.map(order => ({
            order_id: order._id,
            customer_name: order.user?.name || order.shippingAddress?.name,
            payment_method: order.paymentMethod,
            shipping_address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`
        }));

        console.log(formattedOrders);

        res.status(200).json({
            totalOrders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: Number(page),
            orders: formattedOrders
        });

    } catch (err) {
        console.error("Error in getOrders:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate("items.product", "name price imgUrl")
            .lean();

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



export default { placeOrder, getOrders, getOrderDetails }