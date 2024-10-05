const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/authentication");
const {
    getPaymentIntent,
    paymentController,
} = require("../controllers/paymentController");

router.route("/").post(authenticateUser, getPaymentIntent);
router.route("/status/:id").post(paymentController);

module.exports = router;
