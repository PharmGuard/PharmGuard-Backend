const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Log into your Gmail account
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
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