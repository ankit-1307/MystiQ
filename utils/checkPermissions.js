const customError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin") {
        return;
    }
    if (requestUser.userId === resourceUserId.toString()) return;
    throw customError.unauthorizedError("Authorization invalid");
};
module.exports = checkPermissions;
