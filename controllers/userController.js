const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const checkPermissions = require("../utils/checkPermissions");
const { createTokenUser } = require("../utils");

const getAllUsers = async (req, res) => {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(StatusCodes.OK).json({ users, count: users.length });
};
const getSingleUser = async (req, res) => {
    const { id: userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user) {
        throw new customError.badRequestError(
            `No user found for the user id ${userId}`
        );
    }
    checkPermissions(req.user, user);

    res.status(StatusCodes.OK).json({ user });
};
const getCurrentUser = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userId }).select(
        "-password -verificationToken"
    );
    res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
    const {
        name,
        email,
        theme,
        fullAddress,
        fullName,
        locality,
        mobileNumber,
        pincode,
    } = req.body;
    console.log(req.body);

    if (!name || !email || !theme) {
        throw new customError.badRequestError(
            "Name, Email and theme is mandatory"
        );
    }
    const userAddress =
        fullName +
        "," +
        mobileNumber +
        "," +
        pincode +
        "," +
        locality +
        "," +
        fullAddress;
    let user = await User.findOne({ _id: req.user.userId });

    if (!user) {
        throw new customError.badRequestError(
            "No user found for the given email"
        );
    }
    checkPermissions(req.user, user._id);
    console.log(userAddress);

    user.email = email;
    user.name = name;
    user.theme = theme;

    user.userAddress = userAddress;
    user = await user.save();

    const tokenUser = createTokenUser({ payload: user });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new customError.badRequestError(
            "Please provide Old and New password"
        );
    }

    const user = await User.findOne({ _id: req.user.userId });
    const isValidPassword = await user.comparePassword(oldPassword);
    if (!isValidPassword) {
        throw new customError.unauthorizedError("Invalid Credentials");
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.CREATED).json({
        msg: "Password updated successfully",
    });
};

module.exports = {
    getAllUsers,
    updateUser,
    getSingleUser,
    getCurrentUser,
    updateUserPassword,
};
