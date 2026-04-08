import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User reference is required'] 
    },
    items: [{
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
            required: [true, 'Product reference is required']
        },
        quantity: { 
            type: Number, 
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1']
        },
        priceAtPurchase: {  // Store price at time of purchase
            type: Number,
            required: [true, 'Price at purchase is required']
        }
    }],
    totalAmount: { 
        type: Number, 
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    shippingAddress: {
        name: { type: String, required: [true, 'Recipient name is required'] },
        phone: { type: String, required: [true, 'Recipient phone is required'] },
        street: { type: String, required: [true, 'Street address is required'] },
        city: { type: String, required: [true, 'City is required'] },
        additionalInfo: String  // For apartment, floor, etc.
    },
    paymentMethod: { 
        type: String, 
        enum: ['cod', 'mfs'], 
        required: [true, 'Payment method is required'] 
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumber: String,
    notes: String  // For any special instructions
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });  // For getting recent orders first

export default mongoose.model("Order", orderSchema);