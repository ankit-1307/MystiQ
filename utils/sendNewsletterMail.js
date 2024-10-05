const sendEmail = require("./sendEmail");

const sendNewsletterEmail = async ({ email }) => {
    const subject = "20% discount on MystiQ";
    const html = `<h1 style="
    color: #4CAF50; 
    font-family: Arial, sans-serif; 
    font-size: 36px; 
    text-align: center; 
    background-color: #f9f9f9; 
    padding: 20px; 
    border-radius: 10px; 
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    ">Thank you for subscribing to our newsletter!</h1> <div style="
    font-family: Arial, sans-serif; 
    color: #333; 
    background-color: #f4f4f4; 
    padding: 20px; 
    border-radius: 10px; 
    max-width: 600px; 
    margin: 0 auto; 
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    animation: fadeIn 1.5s ease-in-out;
">
    <h3 style="
        color: #4CAF50; 
        font-size: 28px; 
        text-align: center;
        animation: slideDown 2s ease-in-out;
    ">
        We're thrilled to have you on board.
    </h3>

    <p style="
        color: #555; 
        font-size: 18px; 
        text-align: center;
        animation: fadeInText 2.5s ease-in-out;
    ">
        Thanks for subscribing to MystiQ's newsletter! You'll be the first to know about our latest updates and exclusive offers.
    </p>

    <h1 style="
        color: #FF6347; 
        font-size: 32px; 
        text-align: center;
        margin-top: 30px;
        animation: popUp 2s ease-in-out;
    ">
        Stay Tuned For More!
    </h1>

    <div style="
        text-align: center; 
        margin-top: 20px;
        color: #777;
        animation: fadeInText 2.5s ease-in-out;
    ">
        Best,
    </div>
    <div style="
        text-align: center; 
        font-weight: bold; 
        color: #333;
        animation: slideUp 2s ease-in-out;
    ">
        The MystiQ Team
    </div>
</div>

<style>
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeInText {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes popUp {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>

    `;

    const result = await sendEmail({ to: email, subject, html });
    return result;
};

module.exports = sendNewsletterEmail;
