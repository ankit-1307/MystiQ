const Order = require("../model/Order");
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const checkPermissions = require("../utils/checkPermissions");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors/index");

const getAllOrders = async (req, res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
    const { id: orderId } = req.params;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        throw new customError.badRequestError(
            `No order present for the order id: ${orderId}`
        );
    }
    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
};
const createOrder = async (req, res) => {
    const { cartItems, clientSecret, paymentIntentId } = req.body;

    for (item of cartItems) {
        const product = await Product.findOne({ product: cartItems.product });
        if (!product) {
            throw new customError.badRequestError(
                `No Product present for the order id: ${cartItems.product}`
            );
        }
    }
    const cart = await Cart.findOne({ user: req.user.userId });

    //logic for payment is still pending here need to implement stripe
    const order = await Order.create({
        ...cart,
        clientSecret,
        paymentIntentId,
    });

    res.status(StatusCodes.CREATED).json({ order });
};
const getSingleUserOrder = async (req, res) => {
    const { userId } = req.user;
    const orders = await Order.find({ user: userId });

    res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req, res) => {
    const { userId } = req.user;

    const order = await Order.find({ user: userId });
    checkPermissions(req.user, order.user);

    order.paymentIntentId = paymentIntentId;
    order.orderStatus = "Paid";
    await order.save();

    res.status(StatusCodes.OK).json({ msg: "order placed successfully!" });
};

module.exports = {
    getAllOrders,
    getSingleOrder,
    createOrder,
    getSingleUserOrder,
    updateOrder,
};
