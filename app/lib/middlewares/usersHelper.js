const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async signOut(req, res) {
    return res.http200({
      message: stringHelper.strSuccess
    });
  },
}
