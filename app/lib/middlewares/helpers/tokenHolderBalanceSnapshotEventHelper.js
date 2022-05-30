const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils, logsHelper } = global
var mongoose , {isValidObjectId} = require('mongoose');

module.exports = {

  async isEventAssociatedWithUser(organizationId, eventId){
    const filter = { organization: organizationId, _id: true, _id: eventId}
    console.log(await db.TokenHolderBalanceSnapshotEvents.countDocuments(filter))
    return await db.TokenHolderBalanceSnapshotEvents.countDocuments(filter)
  }

}
