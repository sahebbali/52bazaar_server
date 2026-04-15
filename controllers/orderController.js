import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const requester = req.auth.email;
    const currentCustomer = await User.findOne({ email: requester });
    if (!currentCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer not found for the authenticated user",
      });
    }

    console.log("Requester email from token:", requester); // Debug log
    const { items, shipping, payment, notes } = req.body;

    const customer = {
      name: currentCustomer.name,
      email: currentCustomer.email,
      phone: currentCustomer.phone || "",
      address: currentCustomer.address || "",
    };
    console.log("Creating order with data:", req.body);

    // Validation
    if (!customer || !items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "Customer information and items are required",
      });
    }

    // Calculate totals
    let subtotal = 0;
    let itemsCount = 0;
    const orderItems = [];

    for (let item of items) {
      // Find product by SKU or ID
      let product;
      if (item.productId) {
        product = await Product.findById(item.productId);
      } else if (item.sku) {
        product = await Product.findOne({ sku: item.sku });
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with SKU ${item.sku || item.productId} not found`,
        });
      }

      // Check if product is active
      if (!product.is_active) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`,
        });
      }

      // Get the price (use salePrice if available, otherwise regularPrice)
      const price =
        product.salePrice && product.salePrice < product.regularPrice
          ? product.salePrice
          : product.regularPrice;

      // Check stock availability
      const requestedQuantity = item.quantity;
      if (product.stockQuantity < requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${requestedQuantity}`,
        });
      }

      // Calculate item subtotal
      const itemSubtotal = price * requestedQuantity;
      subtotal += itemSubtotal;
      itemsCount += requestedQuantity;

      // Prepare order item
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        sku: product.sku,
        quantity: requestedQuantity,
        price: price,
        originalPrice: product.regularPrice,
        discount: product.salePrice
          ? product.regularPrice - product.salePrice
          : 0,
      });

      // Update stock
      product.stockQuantity -= requestedQuantity;

      // Add low stock alert if needed
      if (product.stockQuantity <= product.lowStockThreshold) {
        console.log(
          `Low stock alert: ${product.name} has only ${product.stockQuantity} units left`,
        );
        // You can trigger email notification here
      }

      await product.save();
    }

    // Calculate taxes and totals
    const taxRate = 0.1; // 10% tax - make this configurable
    const tax = subtotal * taxRate;
    const total = subtotal + (shipping || 0) + tax;

    // Generate unique order ID
    const orderCount = await Order.countDocuments();
    const orderId = `ORD-${Date.now()}-${String(orderCount + 1).padStart(
      4,
      "0",
    )}`;

    // Create order
    const order = new Order({
      orderId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address,
      },
      items: orderItems,
      itemsCount,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat((shipping || 0).toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      payment: {
        method: payment?.method || "pending",
        transactionId: payment?.transactionId || null,
        paymentDate: payment?.method === "credit_card" ? new Date() : null,
      },
      paymentStatus:
        payment?.method === "cash_on_delivery" ? "pending" : "paid",
      status: "pending",
      notes: notes || "",
      timeline: [
        {
          status: "pending",
          date: new Date(),
          note: "Order created successfully",
        },
      ],
    });

    await order.save();

    // Populate product details for response
    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
      "name sku regularPrice salePrice images",
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, sendEmail } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (note) {
      order.timeline.push({ status, note });
    }

    await order.save();

    // If sendEmail is true, trigger email notification
    if (sendEmail) {
      // Implement email sending logic here
      console.log(
        `Email notification sent to ${order.customer.email} about status update to ${status}`,
      );
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update order statuses
// @route   PUT /api/orders/bulk/status
// @access  Private
const bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    const result = await Order.updateMany(
      { orderId: { $in: orderIds } },
      {
        $set: { status },
        $push: { timeline: { status, note: `Bulk updated to ${status}` } },
      },
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) {
      order.payment.transactionId = transactionId;
    }
    if (paymentStatus === "paid") {
      order.payment.paymentDate = new Date();
    }

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/summary
// @access  Private
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const recentOrders = await Order.find().sort("-createdAt").limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllOrdersAdmin,
  getOrderById,
  createOrder,
  updateOrderStatus,
  bulkUpdateStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats,
};
