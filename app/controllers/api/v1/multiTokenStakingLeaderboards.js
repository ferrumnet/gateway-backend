var mongoose = require('mongoose');
const { db, asyncMiddleware } = global
const Web3= require("web3")
const ApeRouterJson = require("../../../../config/apeRouterAbi.json")

module.exports = function (router) {
 

  router.get('/:id/growth', asyncMiddleware(async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id, isPublished: true, status: 'approved' }
    let leaderboard = await db.Leaderboards.findOne(filter).populate('leaderboardStakingContractAddresses')
    if(leaderboard &&  leaderboard.leaderboardStakingContractAddresses.length > 0){     
      let stakingIds = leaderboard.leaderboardStakingContractAddresses.map(item => item.stakingContractAddress) 
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
