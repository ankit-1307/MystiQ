const { StatusCodes } = require("http-status-codes");
const customError = require("./customError");

class badRequestError extends customError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}
module.exports = badRequestError;
