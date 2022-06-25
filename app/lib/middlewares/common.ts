import crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
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
    return jwt.verify(token,((global as any) as any).environment.jwtSecret);
  },

  async validationForUniqueCBN(req: any, res: any) {
    if (req.body.networks && req.body.networks.length > 0) {
      for (let i = 0; i < req.body.networks.length; i++) {
        let filter: any = {};
        filter.tokenContractAddress =
          req.body.networks[i].tokenContractAddress.toLowerCase();
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

  async getValueFromStringsPhrase(queryKey: any) {
    return new Promise((resolve, reject) => {
      fs.readFile("./app/lib/stringsPhrase.json", "utf8", function (err: any, data: any) {
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
      });
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

    if (model && model.leaderboard && model.leaderboard.leaderboardCurrencyAddressesByNetwork &&
      model.leaderboard.leaderboardCurrencyAddressesByNetwork.length > 0) {
      for (let i = 0; i < model.leaderboard.leaderboardCurrencyAddressesByNetwork.length; i++) {
        let item = model.leaderboard.leaderboardCurrencyAddressesByNetwork[i].currencyAddressesByNetwork
        item.tokenHolderBalanceSnapshotEvent = model._id
        (global as any).timeoutCallBack.fetchTokenHolderBalanceSnapshotEvent(item);
      }
    }
  },
};
