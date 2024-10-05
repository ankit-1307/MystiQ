const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [
                50,
                "Max length can't be greater than 50 characters got {VALUE}",
            ],
        },
        description: {
            type: String,
            required: [true, "description is required"],
            trim: true,
            maxlength: [
                500,
                "Max length can't be greater than 500 characters got {VALUE}",
            ],
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            default: 3,
            max: 5,
            min: 1,
        },
    },
    { timestamps: true }
);
ReviewSchema.index({ product: 1, user: 1 });

module.exports = mongoose.model("Review", ReviewSchema);
