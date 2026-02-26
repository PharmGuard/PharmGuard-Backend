const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        //FORCE IPv4 by using the explicit host and service
        //service: 'gmail',
        host: 'smtp.zeptomail.com',
        port: 587,
        secure: false,
        family: 4,
         // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        //ADD THIS: This tells Node to prioritize IPv4 over IPv6
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2. Format the email message
    const mailOptions = {
        from: `PharmGuard System <${process.env.EMAIL_FROM_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Send it!
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;