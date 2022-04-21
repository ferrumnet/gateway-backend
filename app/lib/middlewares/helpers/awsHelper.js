const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global
var mongoose = require('mongoose');
var AWS = require('aws-sdk'),
      region = "us-east-2",
      // secretName = global.environment.secretName,
      secret,
      decodedBinarySecret;

module.exports = {

  async awsSecretsManagerInit() {
    return new Promise(async (resolve, reject) => {
      var client = new AWS.SecretsManager({
        region: region,
        // accessKeyId: global.environment.accessKeyId,
        // secretAccessKey: global.environment.secretAccessKey,
      });
      client.getSecretValue({ SecretId: secretName }, function (err, data) {
        if (err) {
            console.log("aws error: "+err)
            reject('')
        }else {
          if ('SecretString' in data) {
            secret = data.SecretString;
            var secretJson = JSON.parse(secret);
            global.environment = secretJson
          } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
          }
          resolve('')
        }
    })
    });
  }
}
