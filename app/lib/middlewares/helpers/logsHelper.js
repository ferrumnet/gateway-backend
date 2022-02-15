const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async createLog(req, res, isFromSignOut = false) {

    let body = {}
    if(req.body.log){
      body = req.body.log
    }else {
      body = req.body
    }

    if(req.user){
      req.body.user = req.user._id
      body.user = req.user._id
    }

    if (!body.type || !body.user || !isValidObjectId(body.user)) {
      return res.http400('type & valid userId are required.');
    }

    if(body.connectedWalletInformation && body.connectedWalletInformation.address){
      body.connectedWalletInformation.address = (body.connectedWalletInformation.address).toLowerCase()
    }

    body.user = body.user
    body.createdAt = new Date()

    let log = await db.Logs.create(body)

    if(!isFromSignOut){
      return res.http200({
        log: log
      });
    }
  },

  // async updateLog(req, res) {
  //   let filter = {}
  //   filter = { _id: req.params.id }

  //   if (!req.body.type) {
  //     return res.http400('type is required.');
  //   }
  //   delete req.body.userId
  //   req.body.updatedAt = new Date()

  //   let log = await db.Logs.findOneAndUpdate(filter, req.body, { new: true })

  //   return res.http200({
  //     log: log
  //   });

  // }
}
