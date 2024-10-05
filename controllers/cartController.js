const { Cart } = require("../model/Cart");
const Product = require("../model/Product");

const { StatusCodes } = require("http-status-codes");
const customError = require("../errors/index");
const getCartItems = async (req, res) => {
    const { userId } = req.user;

    const cartItems = await Cart.findOne({ user: userId }).populate({
        path: "cartItems.product",
        select: "name company price _id inventory",
    });

    if (!cartItems) {
        const defaultCart = {
            cartItems: [],
            tax: 0,
            shipping: 0,
            total: 0,
        };
        console.log("cartItems " + cartItems);
        return res.status(StatusCodes.OK).json({ cart: defaultCart });
    }

    res.status(StatusCodes.OK).json({ cart: cartItems });
};
//for crating new cart or adding to the existing cart
const updateCartItem = async (req, res) => {
    const { cartItem } = req.body;
    const { userId } = req.user;

    const product = await Product.findOne({ _id: cartItem.product });
    if (!product) {
        throw new customError.badRequestError(
            `No product exists for product id: ${product}`
        );
    }

    const cart = await Cart.findOne({ user: userId });
    console.log("inside the cart");
    if (!cart) {
        // If no cart exists, create a new one
        const singleProduct = {
            quantity: cartItem.quantity,
            color: cartItem.color,
            image: product.image,
            product: product._id,
        };

        const newCart = await Cart.create({
            user: userId,
            cartItems: [singleProduct],
            tax: Number(
                ((cartItem.quantity * product.price * 10) / 100).toFixed(2)
            ),
            shipping:
                Number(cartItem.quantity * product.price) > 9999 ? 0 : 199,
            total: Number(
                (
                    Number(
                        (
                            (cartItem.quantity * product.price * 10) /
                            100
                        ).toFixed(2)
                    ) +
                    Number((cartItem.quantity * product.price).toFixed(2)) +
                    Number(cartItem.quantity * product.price > 9999 ? 0 : 199)
                ).toFixed(2)
            ),
        });

        res.status(StatusCodes.OK).json({ cart: newCart });
        return;
    }

    let oldQuantity = 0;
    let isItemPresent = false;

    const updatedProducts = cart.cartItems
        .map((item) => {
            if (
                item.product.toString() === cartItem.product &&
                item.color === cartItem.color
            ) {
                oldQuantity = item.quantity;
                if (cartItem.quantity === 0) {
                    return null;
                }
                item.quantity = cartItem.quantity;
                isItemPresent = true;
            }
            return item;
        })
        .filter(Boolean);

    if (!isItemPresent && cartItem.quantity > 0) {
        updatedProducts.push({
            quantity: cartItem.quantity,
            color: cartItem.color,
            image: product.image,
            product: product._id,
        });
    }

    const quantityDifference = cartItem.quantity - oldQuantity;

    cart.tax += Number(
        ((quantityDifference * product.price * 10) / 100).toFixed(2)
    );

    const newTotal = Number(
        (
            cart.total -
            cart.shipping +
            quantityDifference * product.price +
            Number((quantityDifference * product.price * 10) / 100)
        ).toFixed(2)
    );

    if (updatedProducts.length === 0) {
        cart.shipping = 0;
        cart.total = 0;
        cart.tax = 0;
    } else {
        cart.shipping = newTotal > 9999 ? 0 : 199;
        cart.total = Number((newTotal + cart.shipping).toFixed(2));
    }

    cart.cartItems = updatedProducts;
    cart.user = userId;

    const updatedCart = await cart.save();

    const sanitizedCart = await Cart.findById(updatedCart._id).select(
        "-createdAt -updatedAt"
    );

    const aggregateCount = await Cart.aggregate([
        { $unwind: "$cartItems" },
        {
            $group: {
                _id: { product: "$cartItems.product" },
                totalQuantity: { $sum: "$cartItems.quantity" },
                count: { $sum: 1 },
            },
        },
    ]);
    const cartItems = await Cart.findOne({ user: userId }).populate({
        path: "cartItems.product",
        select: "name company price _id inventory",
    });
    console.log(cartItems);

    res.status(StatusCodes.CREATED).json({
        cart: cartItems,
        aggregateCount,
    });
};
const removeItem = async (req, res) => {
    const { productId, color, quantity } = req.body;

    const { userId } = req.user;
    const product = await Product.findOne({ _id: productId });

    if (!product) {
        throw new customError.badRequestError(
            `No Product exits for product id: ${product}`
        );
    }
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new customError.badRequestError(
            `No Product exits for product id: ${productId}`
        );
    }

    const newCart = cart.cartItems.filter((item) => {
        return item.product.toString() !== productId || item.color != color;
    });
    const removedItem = cart.cartItems.find((item) => {
        return item.product.toString() == productId && item.color == color;
    });
    if (newCart.length < 1) {
        cart.shipping = 0;
        cart.total = 0;
        cart.tax = 0;
        cart.cartItems = [];
    } else {
        const total =
            Number(((quantity * product.price * 10) / 100).toFixed(2)) +
            quantity * product.price -
            cart.shipping;

        cart.cartItems = newCart;
        cart.tax -= Number(((quantity * product.price * 10) / 100).toFixed(2));
        cart.shipping = cart.total - total > 9999 ? 0 : 199;
        cart.total -= total;
    }
    await cart.save();
    const cartItems = await Cart.findOne({ user: userId }).populate({
        path: "cartItems.product",
        select: "name company price _id inventory",
    });
    res.status(StatusCodes.CREATED).json({ cart: cartItems });
};

const clearCart = async (req, res) => {
    const { userId } = req.user;
    console.log("inside cart clear");

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new customError.badRequestError(
            `No Product exits for product id: ${productId}`
        );
    }

    cart.cartItems = [];
    cart.tax = 0;
    cart.shipping = 0;
    cart.total = 0;
    const updatedCart = await cart.save();
    res.status(StatusCodes.OK).json({ cart: updatedCart });
};

module.exports = { getCartItems, updateCartItem, removeItem, clearCart };
