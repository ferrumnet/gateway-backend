const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, logsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async getOrganizationsCountById(req){
    let organization = req.user.organization
    if(req.body.organization){
        organization = req.body.organization
    }
    const filter = { _id: organization, isActive: true }
    return await db.Organizations.countDocuments(filter)
  }

}
