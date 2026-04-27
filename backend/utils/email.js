const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Campus Hub Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`📧 Notification Email sent to ${to}`);
  } catch (error) {
    console.error("🚨 EMAIL ENGINE ERROR:", error);
  }
};

module.exports = sendEmail;