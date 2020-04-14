const nodemailer = require('nodemailer');
const config     = require('config');

module.exports.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.get('mail'),
    pass: config.get('pass')
  }
});