const express = require("express");
const router = express.Router();
const {
    getCartItems,
    updateCartItem,
    removeItem,
    clearCart,
} = require("../controllers/cartController");
const { authenticateUser } = require("../middlewares/authentication");

router
    .route("/")
    .get(authenticateUser, getCartItems)
    .post(authenticateUser, updateCartItem)
    .patch(authenticateUser, removeItem)
    .delete(authenticateUser, clearCart);

module.exports = router;
