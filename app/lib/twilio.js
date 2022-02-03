const accountSid = 'ACdummy';
const authToken = 'dummy';
const client = require('twilio')(accountSid, authToken);

module.exports = function (to, msg) {
  return client.messages
    .create({
      body: msg,
      from: '',
      to: to
    })
}

