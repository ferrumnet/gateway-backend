var axios = require("axios").default;

async function sendGridEmail(user: any, isFor = "otp", to = null) {
  var postData: any;

  let config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (global as any).environment.sendGridApiKey,
    },
  };

  let url = (global as any).environment.sendGridBaseUrl + "/v3/mail/send";

  var detail = "";
  if (isFor == "link") {
    postData = makeObjectBodyForLink(user);
    // detail = makeLinkDetailForSMTP(user)
  }else if (isFor == "organizationAdminApproved") {
    postData = makeObjectBodyForOrganizationAdminApprovedAndDeclined(user,await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorApprovalIsOnApproved));
    // detail = makeLinkDetailForSMTP(user)
  }else if (isFor == "organizationAdminDeclined") {
    postData = makeObjectBodyForOrganizationAdminApprovedAndDeclined(user,await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorApprovalIsOnDeclined));
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
      .then((response: any) => {
        resolve("");
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
}

function makeObjectBodyForOtp(user: any, sendTo: any) {
  var body: any = {};
  var from: any = {};
  var personalizations = [];
  var to = [];
  var dynamic_template_data: any = {};

  from.email = (global as any).environment.sendGridTransactionalFromEmailAddress;
  from.name = (global as any).environment.sendGridTransactionalFromName;

  let emailTo = sendTo ? sendTo : user.email;
  to.push({ email: emailTo });
  dynamic_template_data.otp = user.emailVerificationCode;
  dynamic_template_data.subject = (global as any).environment.sendGridSubjectOtp;

  personalizations.push({
    to: to,
    dynamic_template_data: dynamic_template_data,
  });

  body.from = from;
  body.personalizations = personalizations;
  body.template_id = (global as any).environment.sendGridTemplateIdForOtp;
  return body;
}

function makeObjectBodyForLink(user: any) {
  var body: any = {};
  var from: any = {};
  var personalizations = [];
  var to = [];
  var dynamic_template_data: any = {};

  from.email = (global as any).environment.sendGridTransactionalFromEmailAddress;
  from.name = (global as any).environment.sendGridTransactionalFromName;

  to.push({ email: user.email });
  dynamic_template_data.resetPasswordLink = user.link;
  dynamic_template_data.subject = (global as any).environment.sendGridSubjectLink;

  personalizations.push({
    to: to,
    dynamic_template_data: dynamic_template_data,
  });

  body.from = from;
  body.personalizations = personalizations;
  body.template_id = (global as any).environment.sendGridTemplateIdForLink;

  return body;
}

function makeObjectBodyForOrganizationAdminApprovedAndDeclined(user: any, message: any) {
  var body: any = {};
  var from: any = {};
  var personalizations = [];
  var to = [];
  var dynamic_template_data: any = {};

  from.email = (global as any).environment.sendGridTransactionalFromEmailAddress;
  from.name = (global as any).environment.sendGridTransactionalFromName;

  to.push({ email: user.email });
  dynamic_template_data.sendgridEmailTemplateMessage = message;
  dynamic_template_data.subject = (global as any).environment.sendGridSubjectAprovedDeclined;

  personalizations.push({
    to: to,
    dynamic_template_data: dynamic_template_data,
  });

  body.from = from;
  body.personalizations = personalizations;
  body.template_id = (global as any).environment.sendGridGenericTemplateId;

  return body;
}

function makeOtpDetailForSMTP(user: any) {
  let detail = `To verify your email address, please use the following One Time Password (OTP):<br/><br/>

  ${user.emailVerificationCode}

  <br/><br/>Do not share this OTP with anyone. At Ferrum Network, we take your account security very seriously. Ferrum Network admins will never ask you to disclose or verify your Ferrum password, OTP, private key or seed phrase. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to our team at Ferrum Network for investigation.<br/><br/>

  Thank you for being part of our community. See you around!`;

  return detail;
}

function makeLinkDetailForSMTP(user: any) {
  let detail = `To verify your email address, please use the following One Time Password (OTP):<br/><br/>

  ${user.link}

  <br/><br/>Do not share this OTP with anyone. At Ferrum Network, we take your account security very seriously. Ferrum Network admins will never ask you to disclose or verify your Ferrum password, OTP, private key or seed phrase. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to our team at Ferrum Network for investigation.<br/><br/>

  Thank you for being part of our community. See you around!`;

  return detail;
}

function capitalizeFirstLetter(data: any) {
  if(!data){
    return data;
  }
  return data.charAt(0).toUpperCase() + data.slice(1);
}

module.exports.sendGridEmail = sendGridEmail;
