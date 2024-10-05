const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const Review = require("../model/Review");
const checkPermissions = require("../utils/checkPermissions");

const createReview = async (req, res) => {
    const { title, description, rating, product } = req.body;
    const { userId } = req.user;

    const isReviewExist = await Review.findOne({
        user: userId,
        product,
    });
    if (isReviewExist) {
        throw new customError.badRequestError("Review already exists");
    }
    //query for user who has placed the order can review it
    const review = await Review.create({
        title,
        description,
        rating,
        user: userId,
        product,
    });
    res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate("reviews");
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.find({ _id: reviewId });
    if (!review) {
        throw new customError.badRequestError(
            `No review exists for review id: ${reviewId}`
        );
    }
    res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const { title, description, rating } = req.body;
    if (!title || !description || !rating) {
        throw new customError.badRequestError(
            `title, description and rating is mandatory `
        );
    }
    const review = await Review.find({ _id: reviewId });
    if (!review) {
        throw new customError.badRequestError(
            `No review exists for review id: ${reviewId}`
        );
    }
    checkPermissions(req.user, review.user);
    review.title = title;
    review.description = description;
    review.rating = rating;
    await review.save();

    res.status(StatusCodes.OK).json({ msg: "review updated successfully" });
};
const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.find({ _id: reviewId });
    if (review.length < 1) {
        throw new customError.badRequestError(
            `No review exists for review id: ${reviewId}`
        );
    }
    checkPermissions(req.user, review.user);
    await review.deleteOne();
    res.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};

const getSingleProductReviews = async (req, res) => {
    const { product } = req.body;
    const reviews = await Review.find({ product });
    if (reviews.length < 1) {
        throw new customError.badRequestError(
            `No review found for the product id ${product}`
        );
    }
    res.status(StatusCodes.OK).json({ reviews });
};

module.exports = {
    getAllReviews,
    createReview,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
};
