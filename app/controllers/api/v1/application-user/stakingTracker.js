const { db, asyncMiddleware, commonFunctions, stringHelper,  stakingTrackerHelper} = global

module.exports = function (router) {

  router.post('/update/myStake', async (req, res) => {
  
    if (!req.body.stakingContractAddress || !req.body.tokenContractAddress ||  !req.body.stakeHolderWalletAddress || !req.body.stakedAmount || !req.body.rewardAmount || !req.body.action || !req.body.amount) {
      return res.http400('stakingContractAddress,tokenContractAddress, stakeHolderWalletAddress, stakedAmount, rewardAmount and action are required.');
    }
    let filter =  {stakingContractAddress: req.body.stakingContractAddress, tokenContractAddress: req.body.tokenContractAddress}
    const stakingParticipantsCount = await db.StakingsTracker.countDocuments(filter)
 
    if(stakingParticipantsCount <  1){
      await stakingTrackerHelper.calculate(req.body.tokenContractAddress, req.body.stakingContractAddress )
    }

    const query = {user: req.user._id, stakingContractAddress: req.body.stakingContractAddress, stakeHolderWalletAddress: req.body.stakeHolderWalletAddress, tokenContractAddress: req.body.tokenContractAddress}
    const update = {$set: {stakedAmount: req.body.stakedAmount, rewardAmount: req.body.rewardAmount}}
    const options = {upsert: true}

    let stake = await db.StakingsTracker.findOne(query)
    if(req.body.action === 'stakeIncrease') {
       req.body.stakedAmount =  Number(req.body.stakedAmount) + Number(req.body.amount)
    }else if(req.body.action === 'stakeWithDrawn'){
        req.body.stakedAmount =  Number(req.body.stakedAmount) - Number(req.body.amount)
    }else if(req.body.action === 'rewardWithDrawn'){
        req.body.rewardAmount =  Number(req.body.rewardAmount) - Number(req.body.amount)
    }
    req.body.totalStakedAmount = stake? Number(stake.totalStakedAmount) + Number(stake.stakedAmount) :  Number(stake.stakedAmount)
   
    stake = await db.StakingsTracker.updateOne(query,update,options)
   
    if(req.body.action === 'stakeIncrease' || req.body.action === 'stakeWithDrawn' ) {
      stakingTrackerHelper.calculate(req.body.stakingContractAddress)
    }
    return res.http200({stake})
  })

  router.get("/list/stakingContractAddress/:stakingContractAddress/tokenContractAddress/:tokenContractAddress",asyncMiddleware(async (req, res) => {
   const participants =  await stakingTrackerHelper.intiatParticipentsData(req.params.tokenContractAddress, req.params.stakingContractAddress )
    return res.http200({ participants });
    })
  )

};
 