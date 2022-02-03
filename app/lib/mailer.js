var nodemailer = require('nodemailer');
var path = require('path');
var ejs = require("ejs");
var Users = require('../models/users');
var smtpTransport = require('nodemailer-smtp-transport');
var gmailConfig = require('../../config/config.json').gmail;
gmailConfig.auth.user = global.environment.SMTPUser
gmailConfig.auth.pass = global.environment.SMTPPass
var nodemailer = nodemailer.createTransport(smtpTransport(gmailConfig));
const fs = require('fs')

module.exports = function () {
  const mailer = {};

  mailer.sendOtp = function (data) {
    var templateDir = path.join(__dirname, '..', 'email_templates', 'otp/otp-template.html');

    ejs.renderFile(templateDir,
        {
          name: data.name
        })
      .then(result => {
        var email = {
          from: gmailConfig.auth.user,
          to: data.email,
          subject: data.subject,
          html: data.detail,
          envelope: {
            from: gmailConfig.appName + gmailConfig.auth.user,
            to: data.email
          }
        };
        nodemailer.sendMail(email, function (error, res) {
          if (error) {
            console.log(error);
          } else {
            console.log(res)
          }
        });
      })
      .catch(err => {
        console.log(err)
      });

  }

  return mailer;
}
