const customError = require("../errors");
const { JWT } = require("../utils");

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies;

    if (!token) {
        throw new customError.unauthenticatedError("Invalid Credentials");
    }
    try {
        const { name, userId, role } = JWT.verifyJWT(token);

        req.user = { name, userId, role };

        next();
        return;
    } catch (error) {
        throw new CustomError.unauthenticatedError("Authentication Invalid");
    }
};

const authorizePermissions = (...rest) => {
    return async (req, res, next) => {
        if (rest.includes(req.user.role)) {
            next();
            return;
        }
        throw new customError.unauthorizedError(
            "Unauthorized to access this route"
        );
    };
};

module.exports = { authenticateUser, authorizePermissions };
