const badRequestError = require("./bad-request");
const notFound = require("./not-found");
const unauthenticatedError = require("./unauthenticated");
const unauthorizedError = require("./unauthorized");

module.exports = {
    badRequestError,
    notFound,
    unauthenticatedError,
    unauthorizedError,
};
