const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global
var mongoose = require('mongoose');

module.exports = {

  async getLeaderboardsCountById(req){
    const filter = { _id: req.body.leaderboard, isActive: true }
    return await db.Leaderboards.countDocuments(filter)
  }

}
