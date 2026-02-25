const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        //FORCE IPv4 by using the explicit host and service
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        family: 4,
        secure: false, // Use SSL
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
        from: `PharmGuard System <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Send it!
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;