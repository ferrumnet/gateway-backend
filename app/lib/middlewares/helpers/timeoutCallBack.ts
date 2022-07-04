
module.exports = {
  async findCompetitionBlocks(jobId: any) {
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
        (global as any).covalenthqBlock.findCovalenthqBlock(job)
      }
    }
  },
  async fetchTokenHolderBalanceSnapshotEvent(model: any, isFromSetTimeout = false) {
    if(model){
      let count = await db.TokenHoldersBalanceSnapshots.countDocuments({tokenHolderBalanceSnapshotEvent: model.tokenHolderBalanceSnapshotEvent, currencyAddressesByNetwork: model._id})
      if(count == 0){
        (global as any).bscScanTokenHolders.findTokenHolders(model, true)
      }
    }
  },
  async triggerTokenHolderBalanceSnapshotEvent(model: any) {
    (global as any).commonFunctions.fetchTokenHolderBalanceSnapshotAgainstCABNs(model)
  }
}
