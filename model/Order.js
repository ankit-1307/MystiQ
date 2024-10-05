const mongoose = require("mongoose");
const { CartItemSchema } = require("./Cart");
const OrderSchema = new mongoose.Schema(
    {
        tax: {
            type: Number,
            required: true,
        },
        shipping: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        },
        cartItems: [CartItemSchema],
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        transactionId: {
            type: String,
            required: true,
        },
        merchantId: {
            type: String,
        },
        paymentStatus: {
            type: String,
            enum: {
                values: [
                    "PAYMENT_SUCCESS",
                    "PAYMENT_FAILED",
                    "PAYMENT_PENDING",
                ],
                message: "{VALUE} is not supported",
            },
        },
        orderStatus: {
            type: String,
            enum: {
                values: [
                    "Placed",
                    "Shipped",
                    "Cancelled",
                    "Not Placed",
                    "Completed",
                    "Paid",
                    "Pending",
                ],
                message: "{VALUE} is not supported",
            },
        },
        shippingAddress: {
            type: String,
            required: true,
            minlength: 15,
            maxlength: 250,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
