const { StatusCodes } = require("http-status-codes");
const customError = require("./customError");

class unauthenticatedError extends customError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}
module.exports = unauthenticatedError;
