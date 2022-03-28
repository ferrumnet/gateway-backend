const { db } = global;

module.exports = {
async getActiveCompetitionForGrowth(tokenContractAddress) {    
    let result =[];
    let filter = [  
      { $match: { isActive: true,  endDate: { $gte: new Date()} } },
      {
        $lookup: {
          from: "leaderboards",
          localField: "leaderboard",
          foreignField: "_id",
          as: "leaderboard",
        },
      },
      { $unwind: { path: "$leaderboard", preserveNullAndEmptyArrays: true } },
      { $match: { "leaderboard.isActive": true } },
      {
        $lookup: {
          from: "leaderboardCurrencyAddressesByNetwork",
          localField: "leaderboard.leaderboardCurrencyAddressesByNetwork",
          foreignField: "_id",
          as: "LCABN",
        },
      },
      { $unwind: { path: "$LCABN", preserveNullAndEmptyArrays: true } },
      { $match: { "LCABN.isActive": true } },
      {
        $lookup: {
          from: "currencyAddressesByNetwork",
          localField: "LCABN.currencyAddressesByNetwork",
          foreignField: "_id",
          as: "CABN",
        },
      },
      { $unwind: { path: "$CABN", preserveNullAndEmptyArrays: true } },
      { $match: { "CABN.isActive": true, 'CABN.tokenContractAddress': tokenContractAddress} },
      {
        $project: {
          _id: 1,
          isActive: 1,
          "competitions._id":1,
          "competitions.startDate":1,
          "competitions.endDate":1,
          "competitions.status":1,
          "competitions.isActive":1,
          "competitions.dexLiquidityPoolCurrencyAddressByNetwork":1,
          "competitions.endBlock":1,
          "competitions.startBlock":1,
          "competitions.currentBlock":1,
          "leaderboard._id": 1,
          "leaderboard.isActive": 1,
          "LCABN._id.sActive": 1,
          "LCABN.isActive": 1,
          "CABN._ID": 1,
          "CABN.isActive": 1,
          "CABN.tokenContractAddress": 1,
        },
      },
    ];
    const competitions = await db.Competitions.aggregate(filter);
  
    competitions.forEach((competition) => {
        if(competition.isActive ){ // can add for publish 
        if(competition.leaderboard && competition.LCABN && competition.CABN){
            if(competition.leaderboard.isActive && competition.LCABN.isActive && competition.CABN.isActive){
                  if(competition.CABN.tokenContractAddress){
                      result.push(competition)
                  }  
            }
        }
    }    
  });   
  return result;  
}
}