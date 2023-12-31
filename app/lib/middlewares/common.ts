import crypto from "crypto";
var CryptoJS = require("crypto-js");
import * as jwt from "jsonwebtoken";
var fs = require("fs");

module.exports = {
  getHashedPassword: function (password: any) {
    return crypto.createHash("sha256").update(password).digest("base64");
  },

  createToken: function (object: any, expiresIn: any) {
    let options: any = {};
    if (expiresIn) {
      options.expiresIn = expiresIn;
    }
    return jwt.sign(object, (global as any).environment.jwtSecret, options);
  },

  decodeAPiToken: function (token: any) {
    return jwt.verify(token, (global as any as any).environment.jwtSecret);
  },

  async validationForUniqueCBN(req: any, res: any) {
    if (req.body.networks && req.body.networks.length > 0) {
      for (let i = 0; i < req.body.networks.length; i++) {
        let filter: any = {};
        filter.tokenContractAddress =
          req.body.networks[i].tokenContractAddress.toLowerCase();
        filter.network = req.body.networks[i].network;
        let count = await db.CurrencyAddressesByNetwork.count(filter);
        if (count != 0) {
          let stringMessage = await this.getValueFromStringsPhrase(
            stringHelper.strErrorUniqueXContractTokenAddress
          );
          return (
            req.body.networks[i].tokenContractAddress + " " + stringMessage
          );
        }
      }
    }

    return "";
  },

  async validationForSCBN(req: any, res: any, smartContract: any) {
    if (req.body.scabn && req.body.scabn.length > 0) {
      for (let i = 0; i < req.body.scabn.length; i++) {
        if (
          !req.body.scabn[i].network ||
          !req.body.scabn[i].smartContractAddress
        ) {
          return res.http400(
            "network & smartContractAddress are required at " + (i + 1)
          );
        }
      }

      if (smartContract) {
        for (let i = 0; i < req.body.scabn.length; i++) {
          let filter: any = {};
          filter.smartContract = smartContract._id;
          filter.network = req.body.scabn[i].network;
          let count = await db.SmartCurrencyAddressesByNetwork.count(filter);
          if (count != 0) {
            let stringMessage = await this.getValueFromStringsPhrase(
              stringHelper.strErrorNetworkHaveAlreadySmartContract
            );
            let network = await db.Networks.findOne({
              _id: req.body.scabn[i].network,
            });
            return network.name + " " + stringMessage;
          }
        }
      }
    }

    return "";
  },

  async getValueFromStringsPhrase(queryKey: any) {
    return new Promise((resolve, reject) => {
      fs.readFile(
        "./app/lib/stringsPhrase.json",
        "utf8",
        function (err: any, data: any) {
          if (err) {
            console.log(err);
            resolve("");
          }
          if (data) {
            const phraseObj = JSON.parse(data);
            if (phraseObj) {
              for (const [key, value] of Object.entries(phraseObj)) {
                if (key == queryKey) {
                  resolve(value);
                  return;
                }
              }
            }
          }
          resolve("");
        }
      );
    });
  },

  async triggerAndSetTimeout(id: any) {
    let job = await db.Jobs.findOne({ _id: id })
      .populate("competition")
      .populate({
        path: "competition",
        populate: {
          path: "leaderboard",
          populate: {
            path: "leaderboardCurrencyAddressesByNetwork",
            populate: {
              path: "currencyAddressesByNetwork",
              populate: {
                path: "network",
                model: "networks",
              },
            },
          },
        },
      });
    (global as any).timeoutHelper.setCompetitionTimeout(job);
  },

  async isUniqueEmail(email: any) {
    const count = await db.Users.count({ email: email });
    return count == 0;
  },

  async fetchTokenHolderBalanceSnapshotAgainstCABNs(model: any) {
    if (
      model &&
      model.leaderboard &&
      model.leaderboard.leaderboardCurrencyAddressesByNetwork &&
      model.leaderboard.leaderboardCurrencyAddressesByNetwork.length > 0
    ) {
      for (
        let i = 0;
        i < model.leaderboard.leaderboardCurrencyAddressesByNetwork.length;
        i++
      ) {
        let item =
          model.leaderboard.leaderboardCurrencyAddressesByNetwork[i]
            .currencyAddressesByNetwork;
        item.tokenHolderBalanceSnapshotEvent = model
          ._id(global as any)
          .timeoutCallBack.fetchTokenHolderBalanceSnapshotEvent(item);
      }
    }
  },

  encryptApiKey: function (data: any) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(
        data,
        (global as any).environment.jwtSecret
      ).toString();
      return ciphertext;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  decryptApiKey: function (data: any) {
    try {
      var bytes = CryptoJS.AES.decrypt(
        data,
        (global as any).environment.jwtSecret
      );
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  encrypt: function (data: string, key: string) {
    try {
      var ciphertext = CryptoJS.AES.encrypt(data, key).toString();
      return ciphertext;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  decrypt: function (data: string, key: string) {
    try {
      var bytes = CryptoJS.AES.decrypt(data, key);
      var originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText;
    } catch (e) {
      console.log(e);
      return "";
    }
  },

  findKey: function (address: string, keys: string) {
    let key = "";
    try {
      let data = JSON.parse(keys);
      if (data && data.length > 0 && address) {
        let item = data.find(
          (item: any) => item.address.toLowerCase() === address.toLowerCase()
        );
        return item ? item.key : "";
      }
    } catch (e) {
      console.log(e);
    }
    return key;
  },

  getMongoDbUrl: function () {
    let url = "";
    let isLocalEnv = (global as any).environment.isLocalEnv;
    let key = (global as any).environment.securityKey;
    let encrypted;
    try {
      if (isLocalEnv) {
        encrypted = (global as any).environment.localMongoConnectionUrl;
      } else {
        encrypted = (global as any).environment.mongoConnectionUrl;
      }
      url = this.decrypt(encrypted, key);
    } catch (e) {
      console.log(e);
    }
    return url;
  },
};
