
const { db, asyncMiddleware, commonFunctions, stringHelper, timeoutHelper } = global

module.exports = {
  async findCompetitionBlocks(jobId) {
    if(jobId){
      console.log(new Date())

      let job = await db.Jobs.findOne({_id: jobId}).populate('competition')
      .populate({
        path: 'competition',
        populate: {
          path: 'leaderboard',
          populate: {
            path: 'leaderboardCurrencyAddressesByNetwork',
            populate: {
              path: 'currencyAddressesByNetwork',
              populate: {
                path: 'network',
                model: 'networks'
              }
            }
          }
        }
      })

      if(job){
        global.covalenthqBlock.findCovalenthqBlock(job)
      }
    }
  },
  async fetchTokenHolderBalanceSnapshotEvent(model, isFromSetTimeout = false) {
    if(model){
      let count = await db.TokenHoldersBalanceSnapshots.countDocuments({tokenHolderBalanceSnapshotEvent: model.tokenHolderBalanceSnapshotEvent, currencyAddressesByNetwork: model._id})
      if(count == 0){
        global.bscScanTokenHolders.findTokenHolders(model, true)
      }
    }
  },
  async triggerTokenHolderBalanceSnapshotEvent(model) {
    global.commonFunctions.fetchTokenHolderBalanceSnapshotAgainstCABNs(model)
  }
}
