const express = require("express");
const router = express.Router();

const {
    getAllOrders,
    getSingleOrder,
    createOrder,
    getSingleUserOrder,
    updateOrder,
} = require("../controllers/orderController");
const {
    authenticateUser,
    authorizePermissions,
} = require("../middlewares/authentication");

router
    .route("/")
    .get(authenticateUser, authorizePermissions("admin", "owner"), getAllOrders)
    .post(authenticateUser, createOrder);
router.route("/getSingleUserOrder").get(authenticateUser, getSingleUserOrder);
router.route("/:id").get(authenticateUser, getSingleOrder);

module.exports = router;
