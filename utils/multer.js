const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/images");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const regex = /\.(svg|jpg|jpeg|png|gif)$/i;
    const allowedMimeTypes = [
        "image/svg+xml",
        "image/jpeg",
        "image/png",
        "image/gif",
    ];

    if (
        allowedMimeTypes.includes(file.mimetype) &&
        regex.test(file.originalname)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fieldSize: 1024 * 1024 * 5 },
});

module.exports = upload;
