const express = require("express");
const router = express.Router();
const {
    getAllProducts,
    createProduct,
    getSingleProduct,
    uploadProductImage,
    newsletterEmail,
    deleteProduct,
} = require("../controllers/productController");

const {
    authenticateUser,
    authorizePermissions,
} = require("../middlewares/authentication");

router
    .route("/")
    .get(authenticateUser, getAllProducts)
    .post(authenticateUser, authorizePermissions("admin"), createProduct);
router.route("/emailSubscription").post(newsletterEmail);
router
    .route("/uploadImage/:id")
    .post(authenticateUser, authorizePermissions("admin"), uploadProductImage);
router
    .route("/deleteProduct/:id")
    .delete(authenticateUser, authorizePermissions("admin"), deleteProduct);
router.route("/:id").get(getSingleProduct);

module.exports = router;
