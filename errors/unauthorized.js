const { StatusCodes } = require("http-status-codes");
const customError = require("./customError");

class unauthorizedError extends customError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.FORBIDDEN;
    }
}
module.exports = unauthorizedError;
