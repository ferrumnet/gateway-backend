const { db } = global;

module.exports = {
  async updateCompetitionCurrentBlock(competitionId, currentBlock) {
    const filter = {_id: competitionId}
    const payload = {currentBlock}
    const competition = await db.Competitions.updateOne(filter,payload);
    return competition
   },

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
          "_id": 1,
          "isActive": 1,
          "startDate":1,
          "endDate":1,
          "status":1,
          "startBlock":1,
          "endBlock":1,
          "type":1,
          "dexLiquidityPoolCurrencyAddressByNetwork":1,
          "leaderboard._id": 1,
          "leaderboard.exclusionWalletAddressList": 1,
          "leaderboard.isActive": 1,
          "LCABN._id": 1,
          "LCABN.isActive": 1,
          "CABN._id": 1,
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
