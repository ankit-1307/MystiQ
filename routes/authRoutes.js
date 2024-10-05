const express = require("express");
const router = express.Router();
const {
    Register,
    Login,
    Logout,
    verifyEmail,
} = require("../controllers/authController");

router.route("/register").post(Register);
router.route("/login").post(Login);
router.route("/user/verify-user").post(verifyEmail);
router.route("/logout").get(Logout);

module.exports = router;
