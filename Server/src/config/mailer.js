require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  {
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user:process.env.MAIL_USER,
      pass:process.env.MAIL_PASS,
    },    tls: {
      rejectUnauthorized: false
    },
  },
);

module.exports = { transporter };
