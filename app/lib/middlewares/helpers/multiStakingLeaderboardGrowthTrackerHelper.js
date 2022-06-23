const { db } = global;

module.exports = {
  async getWalletsBalancesByCABN(currencyAddressesByNetwork) {
    result = await db.TokenHoldersCurrencyAddressesByNetwork.find({currencyAddressesByNetwork});
    if (result.length == 0) {
      result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find({currencyAddressesByNetwork}
      );
    }
    return result;
  },
  async updateStakesHolderHoldings(holdings) {
    let data = [];
    holdings.forEach((holding) => {
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
  async storeStakholdersGrowths(growths) {
    let ids = await db.StakingLeaderboardGrowthTracker.insertMany(growths);
    return await db.StakingLeaderboardGrowthTracker.find({ _id: { $in: ids } });
  },

  async getParticipantsHoldingsGrowthInUsd(stakingContract) {
    let _ids = await db.StakingLeaderboardGrowthTracker.find({stakingContract}).select("_id");
    _ids = _ids.map(id => id._id)
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
  async updateStakesHolderGrowth(holdings) {
    let data = [];
    holdings.forEach((holding) => {
      if (holding) {
        data.push({
          updateOne: {
            filter: {
              _id: holding._id,
            },
            update: {
              $set: {
                growthInUsd: holding.totalGrowthInUsd,
                levelUpAmount: holding.levelUpAmount,
                rank: holding.rank,
              },
            },
          },
        });
      }
    });
    await db.StakingLeaderboardGrowthTracker.collection.bulkWrite(data);
    return true;
  },


  async getStakesHolderGrowthWithHoldings(stakingContractsId){
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
