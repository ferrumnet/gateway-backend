var admin = require("firebase-admin");
var _ = require('lodash');
var serviceAccount = require("../../config/firebase.json");
var appInfo = require('../../config/config.json').appInfo;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dalooni-462db.firebaseio.com"
});


module.exports = {

  sendNotification: function (data) {
    let payload = {
      body: data.message,
      title: data.title ? data.title: appInfo.appName,
      sound: "default",
      notificationType: data.notificationType || "custom"
    };
    if ((data.deviceType) == 'android') {
      payload = {
        data: payload
      }
    } else {
      payload = {
        notification: payload
      }
    }

    console.log('--------------Sending payload');
    console.log(payload);
    console.log('--------------Sending payload');

    this.sendCustomNotifications(data.deviceRegistrationId, payload)
  },
  sendMultipleNotificationAndroid: function (data,tokens) {
    if (!tokens || (tokens instanceof Array && tokens.length < 1)) {
      return Promise.resolve({ msg: {} });
    }

    let payload = {
      body: data.message,
      title: data.title ? data.title: appInfo.appName,
      sound: "default",
      notificationType: data.notificationType || "custom"
    };
    payload = {
      data: payload
    }

    console.log('--------------Sending payload Android');
    console.log(payload);
    console.log('--------------Sending payload Android');

    return this.sendCustomNotifications(tokens, payload)
  },
  sendMultipleNotificationIOS: function (data,tokens) {
    if (!tokens || (tokens instanceof Array && tokens.length < 1)) {
      return Promise.resolve({ msg: {} });
    }

    let payload = {
      body: data.message,
      title: data.title ? data.title: appInfo.appName,
      sound: "default",
      notificationType: data.notificationType || "custom"
    };

    payload = {
      notification: payload
    }

    console.log('--------------Sending payload IOS');
    console.log(payload);
    console.log('--------------Sending payload IOS');

    return this.sendCustomNotifications(tokens, payload)
  },
  sendCustomNotifications: function (registrationTokens, payloads) {

     admin.messaging().sendToDevice(registrationTokens, payloads, {
      priority: "high"
    }).then(function (firebaseRes) {
       console.log(firebaseRes)
     })

  }
}
