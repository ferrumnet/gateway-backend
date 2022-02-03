const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper } = global
var crypto = require('crypto')
var promise = require('bluebird')
var jwt = require('jsonwebtoken')
const jwtVerify = promise.promisify(require('jsonwebtoken').verify)
var fs = require('fs');

module.exports = {
  getHashedPassword: function (password) {
    return crypto.createHash('sha256').update(password).digest('base64')
  },

  createToken: function (object, expiresIn) {
    let options = {}
    if (expiresIn) {
      options.expiresIn = expiresIn
    }
    return jwt.sign(object,
      global.kraken.get('app:jwtSecret'), options
    )
  },

  decodeAPiToken: function (token) {
    return jwtVerify(token, global.kraken.get('app:jwtSecret'))
  },

  async validationForUniqueCBN(req, res) {

    if (req.body.networks && req.body.networks.length > 0) {
      for (let i = 0; i < req.body.networks.length; i++) {
        let filter = {}
        filter.tokenContractAddress = (req.body.networks[i].tokenContractAddress).toLowerCase()
        let count = await db.CurrencyAddressesByNetwork.count(filter)
        if (count != 0) {
          let stringMessage = await this.getValueFromStringsPhrase(stringHelper.strErrorUniqueXContractTokenAddress)
          return req.body.networks[i].tokenContractAddress + ' ' + stringMessage;
        }
      }
    }

    return ''
  },

  async getValueFromStringsPhrase(queryKey) {
    return new Promise((resolve, reject) => {
      fs.readFile('./app/lib/stringsPhrase.json', 'utf8', function (err, data) {
        if (err) {
          console.log(err)
          resolve('');
        }
        if (data) {
          const phraseObj = JSON.parse(data)
          if (phraseObj) {
            for (const [key, value] of Object.entries(phraseObj)) {
              if (key == queryKey) {
                resolve(value);
                return
              }
            }
          }
        }
        resolve('');
      });
    });
  },

  async triggerAndSetTimeout(id) {
    let job = await db.Jobs.findOne({ _id: id }).populate('competition')
      .populate({
        path: 'competition',
        populate: {
          path: 'leaderboard',
          populate: {
            path: 'leaderboardCurrencyAddressesByNetwork',
            populate: {
              path: 'currencyAddressesByNetwork',
              populate: {
                path: 'network',
                model: 'networks'
              }
            }
          }
        }
      })
    global.timeoutHelper.setCompetitionTimeout(job)
  }

}
