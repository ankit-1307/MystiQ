const createTokenUser = require("./createTokenUser");
const JWT = require("./jwt");
const transporter = require("./nodemailerConfiguration");
const sendEmail = require("./sendEmail");
const sendEmailVerification = require("./sendVerificationEmail");
const sendNewsletterEmail = require("./sendNewsletterMail");
const upload = require("./multer");

module.exports = {
    createTokenUser,
    JWT,
    transporter,
    sendEmail,
    sendEmailVerification,
    sendNewsletterEmail,
    upload,
};
