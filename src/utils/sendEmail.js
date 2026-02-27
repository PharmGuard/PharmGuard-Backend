const axios = require('axios');

const sendEmail = async (options) => {
    // ZeptoMail's standard API endpoint
    const url = "https://api.zeptomail.com/v1.1/email";

    // ZeptoMail's specific JSON structure
    const payload = {
        from: {
            address: process.env.EMAIL_FROM_USER, // e.g., "noreply@pharmguard.com" (Must be verified in Zepto)
            name: "PharmGuard System"
        },
        to: [
            {
                email_address: {
                    address: options.email,
                    name: "Employee"
                }
            }
        ],
        subject: options.subject,
        textbody: options.message,
    };
    console.log("Checking API Key:", process.env.EMAIL_PASS ? "It is loaded!" : "IT IS UNDEFINED!");
    console.log("Checking Sender Email:", process.env.EMAIL_FROM_USER);
    try {
        const response = await axios.post(url, payload, {
            headers: {
                // ZeptoMail requires this specific prefix before the token
                "Authorization": `Zoho-enczapikey ${process.env.EMAIL_PASS}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Email sent successfully via ZeptoMail API!");

    } catch (error) {
        // This logs the exact error ZeptoMail throws if something is wrong with the payload
        console.error("ZeptoMail API Error:", error.response ? error.response.data : error.message);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;