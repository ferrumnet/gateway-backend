import moment from "moment";
var crypto = require("crypto");

export const getKey = (url: string, nodeType: string): string => {
  if (
    url.includes(utils.nodeTypes.generator) ||
    nodeType == utils.nodeTypes.generator
  ) {
    return (global as any).environment.generatorNodeApiKey;
  } else if (
    url.includes(utils.nodeTypes.validator) ||
    nodeType == utils.nodeTypes.validator
  ) {
    return (global as any).environment.validatorNodeApiKey;
  } else if (
    url.includes(utils.nodeTypes.master) ||
    nodeType == utils.nodeTypes.master
  ) {
    return (global as any).environment.masterNodeApiKey;
  } else if (url.includes(utils.nodeTypes.fiber)) {
    return (global as any).environment.fiberApiKey;
  }
  return "";
};

export const isTokenValid = (token: any, key: string): boolean => {
  let isValid = false;
  try {
    let decryptedToken = commonFunctions.decrypt(token, key);
    if (decryptedToken) {
      let tokenIntoJsonObject = JSON.parse(decryptedToken);
      if (tokenIntoJsonObject) {
        let isDatesValidate = validateDates(tokenIntoJsonObject);
        if (isDatesValidate) {
          isValid = true;
        }
      }
    }
  } catch (e: any) {
    console.log(e);
    isValid = false;
  }

  return isValid;
};

export const validateDates = (data: any): boolean => {
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
};

export const createAuthToken = (key: string) => {
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
};
