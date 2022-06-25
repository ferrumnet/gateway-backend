var Web3= require("web3")

module.exports = function (router: any) {
  
  router.get('/:id/growth', asyncMiddleware(async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id, isPublished: true, status: 'approved' }
    let leaderboard = await db.Leaderboards.findOne(filter).populate('leaderboardStakingContractAddresses')
    if(leaderboard &&  leaderboard.leaderboardStakingContractAddresses.length > 0){     
      let stakingIds = leaderboard.leaderboardStakingContractAddresses.map((item: any) => item.stakingContractAddress) 
      let participants = await db.StakingLeaderboardGrowthTracker.aggregate([
        {
          '$match': {
            'stakingContract': {
              '$in': stakingIds
            }
          }
        },{
          '$lookup': {
            'from': 'stakingLeaderboardHoldingsTracker', 
            'localField': '_id', 
            'foreignField': 'stakingLeaderboardGrowthTracker', 
            'as': 'holdings'
          }
        },
        { $sort : { "rank" : 1 } }
    ])
    return res.http200({ participants });
   }
    return res.http404('Mutli token staking leaderboard not found')
  }));



};
