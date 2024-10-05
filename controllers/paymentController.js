const salt_index = 1;
var CryptoJS = require("crypto-js");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors/index");
const Product = require("../model/Product");
const { Cart } = require("../model/Cart");
const Order = require("../model/Order");

const generatedTransactionId = () => {
    return "TXN" + uuidv4().toString().substring(0, 8);
};

const calculateTotal = (price, quantity) => {
    const total =
        Number(price) * Number(quantity) +
        Number(price) * Number(quantity) * 0.1;
    return total;
};

const getPaymentIntent = async (req, res) => {
    const { items, address } = req.body;
    console.log(address);

    const fullAddress = Object.values(address).join(",");
    console.log(fullAddress);

    let totalCartValue = 0;
    if (items?.cartItems.length < 1) {
        throw new customError.badRequestError("No items found in the cart");
    }

    for (const item of items?.cartItems) {
        const product = await Product.findOne({ _id: item?.product?._id });
        // console.log(item.quantity);
        // console.log(product.price);

        totalCartValue += calculateTotal(product.price, item.quantity);
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    const cartId = cart._id;
    console.log(cartId);

    console.log(Math.round(totalCartValue));
    // PhonePe Integration started
    const transactionId = generatedTransactionId();
    console.log("transactionId" + transactionId);
    const data = {
        merchantId: process.env.PAYMENT_PROD_MERCHANT,
        merchantTransactionId: transactionId,
        merchantUserId: "MUID123",
        amount: Math.round(totalCartValue) * 100,
        redirectUrl: `http://localhost:5000/payment/status/${transactionId}?cartId=${cartId}&fullAddress=${fullAddress}`, // Change to backend URL
        redirectMode: "POST",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE",
        },
    };
    const payload = JSON.stringify(data);
    const mainPayload = Buffer.from(payload).toString("base64");
    //console.log("payloadMain==> " + mainPayload);

    const str = mainPayload + "/pg/v1/pay" + process.env.PAYMENT_PROD_KEY;
    const sha256 = CryptoJS.SHA256(str).toString();
    const keyIndex = 1;
    const checksum = sha256 + "###" + keyIndex;
    // console.log("checksum==> " + checksum);

    const options = {
        method: "POST",
        url: process.env.PAYMENT_PROD_URL,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
        },
        data: {
            request: mainPayload,
        },
    };
    axios
        .request(options)
        .then(function (response) {
            // console.log("Payment API Response:", response.data);
            const redirect =
                response.data.data.instrumentResponse.redirectInfo.url;
            console.log(redirect);
            return res.status(StatusCodes.OK).send(redirect);
        })
        .catch(function (error) {
            console.error("Payment API Error:", error.message);
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send(error.message);
        });

    //res.status(StatusCodes.OK).send("There was some Error..");
};
const paymentController = async (req, res) => {
    // console.log("inside payment status");
    // console.log(req.query);
    const { cartId, fullAddress } = req.query;
    // console.log(fullAddress);
    const { code, merchantId, transactionId, amount } = req.body;
    // console.log(merchantId, transactionId);
    const cart = await Cart.findById(cartId);
    const orderObject = {
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        cartItems: cart.cartItems,
        user: cart.user,
        transactionId,
        merchantId,
        paymentStatus: "PAYMENT_PENDING",
        orderStatus: "Pending",
        shippingAddress: fullAddress,
    };
    // console.log(cart);

    const order = await Order.create(orderObject);

    const string =
        `/pg/v1/status/${merchantId}/${transactionId}` +
        process.env.PAYMENT_PROD_KEY;
    const keyIndex = 1;
    const sha256 = CryptoJS.SHA256(string).toString();
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: "GET",
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": `${merchantId}`,
        },
    };
    const response = await axios.request(options);
   // console.log("r===", response.data.code);
    if (response.data.code === "PAYMENT_SUCCESS") {
        order.paymentStatus = "PAYMENT_SUCCESS";
        order.orderStatus = "Placed";
        await order.save();
        return res.redirect(
            `http://localhost:5173/payment/status/success/${transactionId}`
        );
    } else {
        order.paymentStatus = "PAYMENT_FAILED";
        order.orderStatus = "Not Placed";
        await order.save();
        return res.redirect(
            `http://localhost:5173/payment/status/failed/${transactionId}`
        );
    }
};

module.exports = { paymentController, getPaymentIntent };
