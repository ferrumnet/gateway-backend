const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, logsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async getOrganizationsCountById(req){
    const filter = { _id: req.user.organization, isActive: true }
    return await db.Organizations.countDocuments(filter)
  }

}
