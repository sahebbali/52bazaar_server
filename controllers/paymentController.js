import Order from "../models/orderModel.js";

const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    if (status) {
      filter.paymentStatus = status;
    }

    if (method) {
      filter["payment.method"] = method;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "payment.transactionId": { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
      ];
    }

    // Run query + count in parallel
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .select("orderId customer payment paymentStatus total status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    // Shape response to match PaymentList data structure
    const payments = orders.map((order) => ({
      id: order._id,
      orderId: order.orderId,
      transactionId: order.payment?.transactionId || "N/A",
      customer: order.customer?.name || "Unknown",
      customerEmail: order.customer?.email,
      amount: order.total,
      method: order.payment?.method || "unknown",
      status: order.paymentStatus,
      date: order.payment?.paymentDate || order.createdAt,
      gatewayResponse: order.paymentStatus === "paid" ? "Success" : "Pending",
      refundable: order.paymentStatus === "paid",
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment ID" });
    }

    const order = await Order.findOne({ orderId: id }).lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    const payment = {
      id: order._id,
      orderId: order.orderId,
      transactionId: order.payment?.transactionId || "N/A",
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      shipping: order.shipping,
      tax: order.tax,
      amount: order.total,
      method: order.payment?.method || "unknown",
      status: order.paymentStatus,
      orderStatus: order.status,
      date: order.payment?.paymentDate || order.createdAt,
      gatewayResponse: order.paymentStatus === "paid" ? "Success" : "Pending",
      refundable: order.paymentStatus === "paid",
      timeline: order.timeline,
      notes: order.notes,
    };

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message,
    });
  }
};

export default {
  getAllPayments,
  getPaymentById,
};
