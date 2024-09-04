const fs = require('fs');

const ejs = require('ejs');
const {htmlToText} = require('html-to-text');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send grid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // 1. Render html based on template
    const html = ejs.render(
      fs.readFileSync(`views/emails/${template}.ejs`, 'utf-8'),
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    // Create a transport and send email
    const newTransporter = this.newTransport();
    await newTransporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the tours family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Reset password!');
  }
};
