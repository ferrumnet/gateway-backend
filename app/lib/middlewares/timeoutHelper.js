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
  }

}
