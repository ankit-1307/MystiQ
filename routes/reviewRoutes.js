const express = require("express");
const router = express.Router();
const {
    getAllReviews,
    createReview,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
} = require("../controllers/reviewController");
const {
    authenticateUser,
    authorizePermissions,
} = require("../middlewares/authentication");
router.route("/").get(getAllReviews).post(authenticateUser, createReview);
router.route("/getSingleProductReview").get(getSingleProductReviews);
router
    .route("/:id")
    .get(getSingleReview)
    .patch(authenticateUser, updateReview)
    .delete(authenticateUser, deleteReview);

module.exports = router;
