const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, bscScanTokenHolders } = global
var mongoose = require('mongoose');

module.exports = {

  async getLeaderboardsCountById(req){
    const filter = { _id: req.body.leaderboard, isActive: true }
    return await db.Leaderboards.countDocuments(filter)
  },
  convertListIntoLowercase(list) {

    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        if (list[i]) {
          list[i] = list[i].toLowerCase()
        }
      }
    }

    return list
  },
  async createLeaderboardCurrencyAddressesByNetwork(body, model) {

    let results = []
    if (model && body.currencyAddressesByNetwork && body.currencyAddressesByNetwork.length > 0) {
      for (let i = 0; i < body.currencyAddressesByNetwork.length; i++) {
        let count = await db.LeaderboardCurrencyAddressesByNetwork.count({ network: body.currencyAddressesByNetwork[i], leaderboard: model._id })
        if (count == 0) {

          let innerBody = {
            currencyAddressesByNetwork: body.currencyAddressesByNetwork[i],
            leaderboard: model._id
          }

          let result = await db.LeaderboardCurrencyAddressesByNetwork.create(innerBody)
          results.push(result._id)
        }
      }
    }

    return results
  },
  fetchTokenHolders(list) {

    if (list && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        bscScanTokenHolders.findTokenHolders(list[i].currencyAddressesByNetwork)
      }
    }
  }

}
