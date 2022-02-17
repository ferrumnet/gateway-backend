const { db, asyncMiddleware, commonFunctions } = global;
const axios = require("axios").default;

function sendGridEmail(user, isFor = "otp", to = null) {
  var postData;

  let config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + global.environment.sendGridApiKey,
    },
  };

  let url = global.environment.sendGridBaseUrl + "/v3/mail/send";

  var detail = "";
  if (isFor == "link") {
    postData = makeObjectBodyForLink(user);
    // detail = makeLinkDetailForSMTP(user)
  } else {
    postData = makeObjectBodyForOtp(user, to);
    // detail = makeOtpDetailForSMTP(user)
  }

  //   const mailObject = {
  //     name: user.name,
  //     email: user.email,
  //     detail: detail,
  //     subject: global.environment.sendGridSubjectOtp
  //   }

  // console.log(mailObject)

  // global.mailer.sendOtp(mailObject);

  return new Promise((resolve, reject) => {
    axios
      .post(url, postData, config)
      .then((response) => {
        resolve("");
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
}

function makeObjectBodyForOtp(user, sendTo) {
  var body = {};
  var from = {};
  var personalizations = [];
  var to = [];
  var dynamic_template_data = {};

  from.email = global.environment.sendGridTransactionalFromEmailAddress;
  from.name = global.environment.sendGridTransactionalFromName;

  emailTo = sendTo ? sendTo : user.email;
  to.push({ email: emailTo });
  dynamic_template_data.otp = user.emailVerificationCode;
  dynamic_template_data.subject = global.environment.sendGridSubjectOtp;

  personalizations.push({
    to: to,
    dynamic_template_data: dynamic_template_data,
  });

  body.from = from;
  body.personalizations = personalizations;
  body.template_id = global.environment.sendGridTemplateIdForOtp;
  return body;
}

function makeObjectBodyForLink(user) {
  var body = {};
  var from = {};
  var personalizations = [];
  var to = [];
  var dynamic_template_data = {};

  from.email = global.environment.sendGridTransactionalFromEmailAddress;
  from.name = global.environment.sendGridTransactionalFromName;

  to.push({ email: user.email });
  dynamic_template_data.resetPasswordLink = user.link;
  dynamic_template_data.subject = global.environment.sendGridSubjectLink;

  personalizations.push({
    to: to,
    dynamic_template_data: dynamic_template_data,
  });

  body.from = from;
  body.personalizations = personalizations;
  body.template_id = global.environment.sendGridTemplateIdForLink;

  return body;
}

function makeOtpDetailForSMTP(user) {
  let detail = `To verify your email address, please use the following One Time Password (OTP):<br/><br/>

  ${user.emailVerificationCode}

  <br/><br/>Do not share this OTP with anyone. At Ferrum Network, we take your account security very seriously. Ferrum Network admins will never ask you to disclose or verify your Ferrum password, OTP, private key or seed phrase. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to our team at Ferrum Network for investigation.<br/><br/>

  Thank you for being part of our community. See you around!`;

  return detail;
}

function makeLinkDetailForSMTP(user) {
  let detail = `To verify your email address, please use the following One Time Password (OTP):<br/><br/>

  ${user.link}

  <br/><br/>Do not share this OTP with anyone. At Ferrum Network, we take your account security very seriously. Ferrum Network admins will never ask you to disclose or verify your Ferrum password, OTP, private key or seed phrase. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to our team at Ferrum Network for investigation.<br/><br/>

  Thank you for being part of our community. See you around!`;

  return detail;
}

module.exports.sendGridEmail = sendGridEmail;
