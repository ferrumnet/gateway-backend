var nodemailer = require('nodemailer');
var path = require('path');
var ejs = require("ejs");
var Users = require('../models/users');
var smtpTransport = require('nodemailer-smtp-transport');
var gmailConfig = require('../../config/config.json').gmail;
gmailConfig.auth.user = (global as any).environment.SMTPUser
gmailConfig.auth.pass = (global as any).environment.SMTPPass
var nodemailer = nodemailer.createTransport(smtpTransport(gmailConfig));
var fs = require('fs')

module.exports = function () {
  const mailer: any = {};

  mailer.sendOtp = function (data: any) {
    var templateDir = path.join(__dirname, '..', 'email_templates', 'otp/otp-template.html');

    ejs.renderFile(templateDir,
        {
          name: data.name
        })
      .then((result: any) => {
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
        nodemailer.sendMail(email, function (error: any, res: any) {
          if (error) {
            console.log(error);
          } else {
            console.log(res)
          }
        });
      })
      .catch((err: any) => {
        console.log(err)
      });

  }

  return mailer;
}
