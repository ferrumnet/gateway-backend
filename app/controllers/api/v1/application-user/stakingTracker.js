const { db, asyncMiddleware, commonFunctions, stringHelper,  stakingTrackerHelper} = global

module.exports = function (router) {

  router.post('/update/myStake', asyncMiddleware(async (req, res) => {

    if (!req.body.stakingContractAddress || !req.body.tokenContractAddress ||  !req.body.stakeHolderWalletAddress || !req.body.stakedAmount || !req.body.rewardAmount || !req.body.action || !req.body.amount) {
      return res.http400('stakingContractAddress,tokenContractAddress, stakeHolderWalletAddress, stakedAmount, rewardAmount and action are required.');
    }

    if(req.body.action === 'stakeIncrease') {
       req.body.stakedAmount =  Number(req.body.stakedAmount) + Number(req.body.amount)
    }else if(req.body.action === 'stakeWithDrawn'){
        req.body.stakedAmount =  Number(req.body.stakedAmount) - Number(req.body.amount)
    }else if(req.body.action === 'rewardWithDrawn'){
        req.body.rewardAmount =  Number(req.body.rewardAmount) - Number(req.body.amount)
    }

    const query = {user: req.user._id, stakingContractAddress: req.body.stakeContractAddress, stakeHolderWalletAddress: req.body.stakeHolderWalletAddress, tokenContractAddress: req.body.tokenContractAddress}
    const update = {$set: {stakedAmount: req.body.stakedAmount, rewardAmount: req.body.rewardAmount}}
    const options = {upsert: true}
    
    const stake = await db.StakingTracker.updateOne(query,update,options)
   
    if(req.body.action === 'stakeIncrease' || req.body.action === 'stakeWithDrawn' ) {
      stakingTrackerHelper()
    }
    return res.http200({stake})
  }))

  router.get("/list/stakingContractAddress/:stakingContractAddress/tokenContractAddress/:tokenContractAddress",asyncMiddleware(async (req, res) => {
     let filter = {stakingContractAddress: req.params.stakingContractAddress,tokenContractAddress: req.params.tokenContractAddress }
    let participants = []
    let sort = { rank: 1 }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      participants = await db.StakingTracker.find(filter).sort(sort)
    } else {
      participants = await db.StakingTracker.find(filter).sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)
    }
    return res.http200({ participants });
    })
  )

};
