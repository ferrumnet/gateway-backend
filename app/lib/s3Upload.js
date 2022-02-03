var s3 = require('s3');
var fs = require('fs');

module.exports = async function (path,name) {


  return new Promise((resolve, reject) => {
    var client = s3.createClient({
      maxAsyncS3: 60,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 55728640, // default (15 MB)
      s3Options: {
        accessKeyId: "",
        secretAccessKey: "",
        region: ""
      }
    });

    var key = "pdfs/" + name + ".pdf"
    var params = {
      localFile: path,
      s3Params: {
        Bucket: "Leaderboard",
        Key: key,
        Body: key,
        ACL: "public-read",
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      }
    };

    var uploader = client.uploadFile(params)
    uploader.on('error', function (err) {
      reject(err.stack)
    });
    uploader.on('progress', function () {
    });
    uploader.on('end', function () {
      resolve(""+key)
    });
  })

}

