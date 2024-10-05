const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        image: {
            type: String,
            required: true,
            default: "./uploads/images",
        },
    },
    { toObject: true, toJSON: true }
);

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        cartItems: [CartItemSchema],
        tax: {
            type: Number,
            required: true,
        },
        shipping: {
            type: Number,
            required: true,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

const Cart = mongoose.model("Cart", CartSchema);
module.exports = { Cart, CartItemSchema };
