const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async createLog(req, res) {

    if(req.user){
      req.body.user = req.user._id
    }

    if (!req.body.type || !req.body.user || !isValidObjectId(req.body.user)) {
      return res.http400('type & valid userId are required.');
    }

    req.body.user = req.body.user
    req.body.createdAt = new Date()

    let log = await db.Logs.create(req.body)

    return res.http200({
      log: log
    });
  },

  async updateLog(req, res) {
    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.type) {
      return res.http400('type is required.');
    }
    delete req.body.userId
    req.body.updatedAt = new Date()

    let log = await db.Logs.findOneAndUpdate(filter, req.body, { new: true })

    return res.http200({
      log: log
    });

  }
}
