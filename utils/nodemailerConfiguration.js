const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: "alexandra.padberg@ethereal.email",
        pass: "jGywWjTSMYvnBP8puP",
    },
});
module.exports = transporter;
