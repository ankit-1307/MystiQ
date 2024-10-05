const jwt = require("jsonwebtoken");

const createJWT = (payload) => {
    const token = jwt.sign({ payload }, process.env.JWT_SECRET);
    return token;
};
const verifyJWT = ({ token: userToken }) => {
    try {
        const isTokenValid = jwt.verify(userToken, process.env.JWT_SECRET);

        return isTokenValid.payload;
    } catch (error) {
        console.log("error from verify jwt" + error);

        return error;
    }
};
const attachCookiesToResponse = async ({ res, payload }) => {
    if (!res || typeof res.cookie !== "function") {
        console.log("Invalid response object");
        return;
    }

    const token = createJWT(payload);

    const oneDay = 1000 * 60 * 60 * 24;
    const isProduction = process.env.NODE_ENV === "production"; // Check if the environment is production
    res.cookie("token", token, {
        httpOnly: true,
        signed: true,
        maxAge: oneDay,
        secure: isProduction, // Secure only in production
        sameSite: isProduction ? "None" : "Lax",
    });
};
module.exports = { createJWT, verifyJWT, attachCookiesToResponse };
