const { StatusCodes } = require("http-status-codes");
const Product = require("../model/Product");
const customError = require("../errors/index");
const upload = require("../utils/multer");
const fs = require("fs");
const { sendNewsletterEmail } = require("../utils");
const cloudUpload = require("../utils/cloudinaryConfig");

const getAllProducts = async (req, res) => {
    const {
        name,
        freeShipping,
        sort,
        featured,
        company,
        category,
        filter,
        color,
    } = req.query;
    console.log(featured);
    console.log(name);
    

    const decodedFilter = decodeURIComponent(filter);

    const queryObject = {};

    if (freeShipping) {
        queryObject.freeShipping = freeShipping == "on" ? true : false;
    }
    if (featured) {
        queryObject.featured = featured === "true" ? true : false;
    }
    if (company) {
        queryObject.company = company;
    }
    if (category) {
        queryObject.category = category;
    }
    if (name) {
        queryObject.name = { $regex: name, $options: "i" };
    }
    if (color) {
        queryObject.colors = { $in: color };
    }
    // console.log(req.query);

    // console.log("queryObject");
    // console.log(queryObject);

    const queryOperators = {
        ">": "$gt",
        "<": "$lt",
        "<=": "$lte",
        ">=": "$gte",
        "=": "$eq",
    };
    const regex = /(>|<|>=|<=|=)\b/g;
    let filterQuery = [];
    if (decodedFilter) {
        filterQuery = decodedFilter
            .replace(regex, (match) => {
                return `-${queryOperators[match]}-`;
            })
            .split(",");
        //add aggregate function
    }
    filterQuery.forEach((item) => {
        const options = ["price", "averageRating"];
        const [field, operator, value] = item.split("-");
        if (options.includes(field)) {
            queryObject[field] = {
                ...queryObject[field],
                [operator]: Number(value),
            };
        }
    });

    let result = Product.find(queryObject);

    if (sort === "a-z") {
        result = result.sort("name");
    }
    if (sort === "z-a") {
        result = result.sort("-name");
    }
    if (sort === "oldest") {
        result = result.sort("createdAt");
    }
    if (sort === "newest") {
        result = result.sort("-createdAt");
    }
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;
    const skip = limit * (page - 1);
    const { companies, categories, colors } = await fetchQueryFilter();
    const products = await result.skip(skip).limit(limit).populate("reviews");
    // console.log(products);

    res.status(StatusCodes.OK).json({
        products,
        count: products.length,
        companies,
        categories,
        colors,
    });
};
const fetchQueryFilter = async () => {
    try {
        const companies = await Product.distinct("company");
        const categories = await Product.distinct("category");
        const colorsArr = await Product.aggregate([
            { $unwind: "$colors" }, // Deconstruct the colors array
            { $group: { _id: "$colors" } }, // Group by color to get unique values
        ]);
        const colors = colorsArr.map((color) => {
            return color._id;
        });
        const colorsSet = new Set();
        colorsSet.add(colors);

        return { companies, categories, colors: Array.from(colorsSet) };
    } catch (error) {
        throw new customError.badRequestError("No products found!");
    }
};

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;

    if (!productId) {
        throw new customError.badRequestError(
            `No Product found for product id: ${productId}`
        );
    }
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        throw new customError.badRequestError(
            `No Product found for product id: ${productId}`
        );
    }
    res.status(StatusCodes.OK).json({ product });
};
const createProduct = async (req, res) => {
    let products = [];
    for (item of req.body) {
        item.user = req.user.userId;
        const product = await Product.create(item);
        products = [...products, product];
    }
    res.status(StatusCodes.CREATED).json({ products });
};
const uploadProductImage = async (req, res) => {
    const { id: productId } = req.params;

    upload.array("images", 5)(req, res, async (err) => {
        if (err) {
            console.log(err);
            res.status(StatusCodes.BAD_REQUEST).json({
                msg: "File upload failed",
                error: err.message,
            });
        } else {
            let result = [];
            for (const item of req.files) {
                try {
                    const path = item.destination + "/" + item?.originalname;

                    const cloudPath = await cloudUpload(path);
                    const product = await Product.findOneAndUpdate(
                        { _id: productId },
                        {
                            image: cloudPath.url,
                        },
                        { new: true }
                    );
                    fs.unlinkSync(path);
                    result.push(cloudPath);
                } catch (error) {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        msg: "Error in upload",
                    });
                    return;
                }
            }

            res.status(StatusCodes.CREATED).json({
                msg: "Files uploaded successfully",
                files: result,
            });
        }
    });
};

const newsletterEmail = async (req, res) => {
    const { email } = req.body;

    await sendNewsletterEmail({ email });
    res.status(StatusCodes.OK).json({ msg: "Subscription successful" });
};
const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        throw new customError.badRequestError(
            `No Product found for product id: ${productId}`
        );
    }
    //delete product but before it other dependencies needs to be taken care so first work on review then this route
    await Product.deleteOne({ _id: product._id });
    res.status(StatusCodes.OK).json({
        msg: "Product removed successfully",
    });
};

module.exports = {
    getAllProducts,
    createProduct,
    getSingleProduct,
    uploadProductImage,
    newsletterEmail,
    deleteProduct,
    fetchQueryFilter,
};
