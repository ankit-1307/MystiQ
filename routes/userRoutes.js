const express = require("express");
const router = express.Router();
const {
    updateUser,
    getAllUsers,
    getSingleUser,
    getCurrentUser,
    updateUserPassword,
} = require("../controllers/userController");
const {
    authenticateUser,
    authorizePermissions,
} = require("../middlewares/authentication");

router
    .route("/")
    .get(authenticateUser, authorizePermissions("admin"), getAllUsers);
router.route("/showMe").get(authenticateUser, getCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;
