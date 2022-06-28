const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, logsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async signOut(req, res) {
    if(req.body && req.body.log){
      await logsHelper.createLog(req, res, true)
    }
    return res.http200({
      message: stringHelper.strSuccess
    });
  },
}


