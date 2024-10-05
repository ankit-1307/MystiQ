const transporter = require("./nodemailerConfiguration");

const sendEmail = async ({ to, subject, html }) => {
    const info = await transporter.sendMail({
        from: "'Code Learner' <codelearner1307@gmail.com>",
        to,
        subject,
        html,
    });
    return info;
};

module.exports = sendEmail;
