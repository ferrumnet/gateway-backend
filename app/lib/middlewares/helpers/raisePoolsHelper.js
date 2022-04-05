const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, logsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async isAlreadyPledged(req, res) {
    return new Promise(async(resolve, reject) => {
      let count = await db.PledgeRaisePools.count({raisePoolId: req.params.id, pledgedUserId: req.user._id})
      if(count > 0){
        reject(stringHelper.strErrorAlreadyPledged);
      }else {
        resolve(count);
      }
    });
  },
}
