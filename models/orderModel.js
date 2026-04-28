import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      phone: String,
      address: {
        type: String,
      },
    },
    items: [orderItemSchema],
    itemsCount: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        enum: ["bkash", "cash_on_delivery"],
      },
      transactionId: String,
      paymentDate: Date,
      bkashNumber: String,
    },
    shippingAddress: [
      {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        zipCode: String,
      },
    ],
    timeline: [timelineSchema],
    notes: String,
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    coupons: [
      {
        code: {
          type: String,
          required: true,
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
          required: true,
        },
        discountValue: {
          type: Number,
          required: true,
        },
        discountAmount: {
          type: Number,
          required: true,
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Generate order ID before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count = await this.constructor.countDocuments();
    this.orderId = `ORD-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// Update timeline when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const statusMessages = {
      pending: "Order placed and awaiting processing",
      processing: "Order is being processed",
      shipped: "Order has been shipped",
      delivered: "Order has been delivered",
      cancelled: "Order has been cancelled",
    };

    this.timeline.push({
      status: this.status,
      date: new Date(),
      note: statusMessages[this.status],
    });
  }
  next();
});

//

export default mongoose.model("Order", orderSchema);
