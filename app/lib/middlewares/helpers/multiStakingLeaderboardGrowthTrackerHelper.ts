module.exports = {
  async getWalletsBalancesByCABN(currencyAddressesByNetwork: any) {
    let result = await db.TokenHoldersCurrencyAddressesByNetwork.find({currencyAddressesByNetwork});
    if (result.length == 0) {
      result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find({currencyAddressesByNetwork});
    }
    return result;
  },
  async updateStakesHolderHoldings(holdings: any) {
    let data: any = [];
    holdings.forEach((holding: any) => {
      if (holding) {
        data.push({
          updateOne: {
            filter: {
              stakingLeaderboardGrowthTracker:
                holding.stakingLeaderboardGrowthTracker,
              tokenContractAddress: holding.tokenContractAddress,
            },
            update: {
              $set: {
                totalHoldingUSDValue: holding.totalHoldingUSDValue,
                walletCurrentBalance: holding.walletCurrentBalance,
                stakedAmount: holding.stakedAmount,
              },
            },
            upsert: true,
          },
        });
      }
    });
    await db.StakingLeaderboardHoldingsTracker.collection.bulkWrite(data);
    return true;
  },
  async storeStakholdersGrowths(growths: any) {
    let ids = await db.StakingLeaderboardGrowthTracker.insertMany(growths);
    return await db.StakingLeaderboardGrowthTracker.find({ _id: { $in: ids } });
  },

  async getParticipantsHoldingsGrowthInUsd(leaderboardId: any) {
   let _ids = await db.StakingLeaderboardGrowthTracker.find({leaderboard:leaderboardId}).select("_id");
    _ids = _ids.map((id: any) => id._id)
    return await db.StakingLeaderboardHoldingsTracker.aggregate([
      { $match: { stakingLeaderboardGrowthTracker: { $in: _ids } } },
      {
        $group: {
          _id: "$stakingLeaderboardGrowthTracker",
          totalGrowthInUsd: { $sum: "$totalHoldingUSDValue" },
        },
      },
    ]);
  },
  async updateStakesHolderGrowth(holdings: any) {
    let data: any = [];
    holdings.forEach((holding: any) => {
      if (holding) {
        data.push({
          updateOne: {
            filter: {
              _id: holding._id,
            },
            update: {
              $set: {
                growthInUsd: holding.totalGrowthInUsd,
                usdLevelUpAmountWithWalletBalance: holding.levelUpAmount,
                rank: holding.rank,
                levelUpTokensWithWalletBalance: holding.levelUpTokensWithWalletBalance
              },
            },
          },
        });
      }
    });
    if(data.length > 0){
      await db.StakingLeaderboardGrowthTracker.collection.bulkWrite(data);
    }
    return true;
  },


  async getStakesHolderGrowthWithHoldings(stakingContractsId: any ){
    let participantsHoldings = await db.StakingLeaderboardGrowthTracker.aggregate([
      {
          '$match': {
              'stakingContract': stakingContractsId
          },
      },
      {
          '$lookup': {
              'from': 'stakingLeaderboardHoldingsTracker',
              'localField': '_id',
              'foreignField': 'stakingLeaderboardGrowthTracker',
              'as': 'holdings'
          }
      }
    ]);
    return participantsHoldings
  }
};
