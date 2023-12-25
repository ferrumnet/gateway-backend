import moment from "moment";
var crypto = require("crypto");

module.exports = {
  isTokenValid(token: any, key: string): boolean {
    let isValid = false;
    try {
      let decryptedToken = commonFunctions.decrypt(token, key);
      if (decryptedToken) {
        let tokenIntoJsonObject = JSON.parse(decryptedToken);
        if (tokenIntoJsonObject) {
          let validateDates = this.validateDates(tokenIntoJsonObject);
          if (validateDates) {
            isValid = true;
          }
        }
      }
    } catch (e: any) {
      console.log(e);
      isValid = false;
    }

    return isValid;
  },

  validateDates(data: any) {
    try {
      if (data.startDateTime && data.endDateTime) {
        let currentDate = moment().utc();
        let startDate = moment(data.startDateTime).utc();
        let endDate = moment(data.endDateTime).utc();
        return currentDate.isBetween(startDate, endDate);
      }
    } catch (e: any) {
      console.log(e);
    }

    return false;
  },

  async createAuthToken(key: string) {
    let timelapse = 1;
    let currentTime = new Date();
    let startDateTime = moment(currentTime)
      .subtract("minutes", timelapse)
      .utc()
      .format();
    let endDateTime = moment(currentTime)
      .add("minutes", timelapse)
      .utc()
      .format();
    let randomKey = crypto.randomBytes(512).toString("hex");
    let tokenBody: any = {};
    tokenBody.startDateTime = startDateTime;
    tokenBody.endDateTime = endDateTime;
    tokenBody.randomKey = randomKey;

    let strTokenBody = JSON.stringify(tokenBody);
    let encryptedSessionToken = commonFunctions.encrypt(strTokenBody, key);
    return encryptedSessionToken;
  },
};
