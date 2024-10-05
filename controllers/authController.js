const { StatusCodes } = require("http-status-codes");
const User = require("../model/User");
const customError = require("../errors");
const { createTokenUser, JWT, sendEmailVerification } = require("../utils");
const crypto = require("crypto");

const Register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!email && !password && !name) {
        throw new customError.badRequestError(
            "Please provide email, password and name"
        );
    }
    const duplicateUser = await User.findOne({ email });

    if (duplicateUser) {
        throw new customError.badRequestError("Email already in use");
    }
    const userCount = await User.countDocuments({});
    if (userCount < 1) {
        role ? "admin" : "user";
    }
    const verificationToken = crypto.randomBytes(40).toString("hex");

    const user = await User.create({
        name,
        email,
        password,
        role,
        verificationToken,
    });

    const result = await sendEmailVerification({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
    });

    const userToken = createTokenUser({ payload: user });
    JWT.attachCookiesToResponse({ res, payload: userToken });
    res.status(StatusCodes.CREATED).json({ user: userToken });
};

const verifyEmail = async (req, res) => {
    const { token, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new customError.unauthenticatedError("Invalid Credentials");
    }
    if (user.verificationToken !== token) {
        throw new customError.unauthenticatedError("Invalid Credentials");
    }
    user.verificationToken = "";
    user.isVerified = true;
    user.verified = Date.now();
    const verifiedUser = await user.save();

    const userToken = createTokenUser({ payload: user });

    res.status(StatusCodes.OK).json({ user: userToken });
};

const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(StatusCodes.CREATED).json({
            msg: "Please provide email, password and name",
        });
        return;
    }
    const user = await User.findOne({ email });

    if (!user) {
        throw new customError.badRequestError("Invalid credentials");
    }
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        throw new customError.unauthenticatedError("Invalid credentials");
    }
    if (!user.isVerified) {
        throw new customError.unauthenticatedError(
            "account verification pending"
        );
    }
    const userToken = createTokenUser({ payload: user });

    JWT.attachCookiesToResponse({ res, payload: userToken });
    console.log(res.signedCookie);

    res.status(StatusCodes.CREATED).json({ user: userToken });
};
const Logout = async (req, res) => {
    res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: "Logged out successfully!" });
};

module.exports = { Register, Login, Logout, verifyEmail };
