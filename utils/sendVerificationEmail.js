const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({ name, email, verificationToken }) => {
    const verificationUrl = "http://localhost:5173";
    const subject = "Account Verification";
    const html = `<p>Hello ${name}, Please Click to verify your account <a href=${verificationUrl}/user/verify-user?token=${verificationToken}&email=${email}  target="_blank">Verification Link</a></p>`;

    const result = await sendEmail({ to: email, subject, html });
    return result;
};

module.exports = sendVerificationEmail;
