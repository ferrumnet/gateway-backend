import moment from "moment";
const Crypto = require("crypto");
const CryptoJS = require("crypto-js");

export const baseURL = "https://api-leaderboard.dev.svcs.ferrumnetwork.io";
export const fiberApiKey = "";
export const generatorNodeApiKey = "";
export const validatorNodeApiKey = "";
export const masterNodeApiKey = "";
export const generatorNodePublicKey =
  "0xf81f80c04c421f98c06232d2df7e2ac8790bb19b";
export const validatorNodePublicKey =
  "0xf81f80c04c421f98c06232d2df7e2ac8790bb19b";
export const masterNodePublicKey = "0xf81f80c04c421f98c06232d2df7e2ac8790bb19b";

export const createAuthTokenForNodeInfra = function (apiKey: string) {
  let timelapse = 5;
  let currentTime = new Date();
  let startDateTime = moment(currentTime)
    .subtract("minutes", timelapse)
    .utc()
    .format();
  let endDateTime = moment(currentTime)
    .add("minutes", timelapse)
    .utc()
    .format();
  let randomKey = Crypto.randomBytes(512).toString("hex");
  let tokenBody: any = {};
  tokenBody.startDateTime = startDateTime;
  tokenBody.endDateTime = endDateTime;
  tokenBody.randomKey = randomKey;

  let strTokenBody = JSON.stringify(tokenBody);
  let encryptedSessionToken = encrypt(strTokenBody, apiKey);
  return encryptedSessionToken;
};

export const encrypt = function (data: string, key: String) {
  try {
    var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
    return ciphertext;
  } catch (e) {
    console.log(e);
    return "";
  }
};
