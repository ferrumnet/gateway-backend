const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper, timeoutCallBack, utils } = global

module.exports = {

  async setCompetitionTimeout(model) {
    var now = moment().utc()
    if(model && model.type && model.type == 'competition' && model.competition
    && model.competition.startDateAfterDelay && model.competition.endDateAfterDelay ){

      let start = moment(model.competition.startDateAfterDelay).utc()
      let end = moment(model.competition.endDateAfterDelay).utc()
      let to = start
      if(model.status == stringHelper.tagEndBlock){
        to = end
      }

      var duration = moment.duration(to.diff(now));
      let milliseconds = duration.asMilliseconds()
      console.log(milliseconds)
      if(milliseconds > 0){
      utils.increaseTimeOutCount()
      let timeout = setTimeout(function(){timeoutCallBack.findCompetitionBlocks(model._id)}, milliseconds);
      }else {
        global.covalenthqBlock.findCovalenthqBlock(model)
      }
    }
  },

  async setSnapshotEventsTimeout(model) {

    model = await db.TokenHolderBalanceSnapshotEvents.findOne({_id: model._id}).populate({
      path: 'leaderboard',
      populate: {
        path: 'leaderboardCurrencyAddressesByNetwork',
        populate: {
          path: 'currencyAddressesByNetwork',
          model: 'currencyAddressesByNetwork'
        }
      }
    })

    var now = moment().utc()
    if(model && model.type && model.type == 'schedule' && model.triggeredSnapshotDateTime){
      let time = moment(model.triggeredSnapshotDateTime).utc()
      var duration = moment.duration(time.diff(now));
      let milliseconds = duration.asMilliseconds()
      if(milliseconds > 0){
      let timeout = setTimeout(function(){timeoutCallBack.triggerTokenHolderBalanceSnapshotEvent(model)}, milliseconds);
      }else {
        global.commonFunctions.fetchTokenHolderBalanceSnapshotAgainstCABNs(model)
      }
    }else if(model && model.type && model.type == 'manual'){
      global.commonFunctions.fetchTokenHolderBalanceSnapshotAgainstCABNs(model)
    }
  }
}
