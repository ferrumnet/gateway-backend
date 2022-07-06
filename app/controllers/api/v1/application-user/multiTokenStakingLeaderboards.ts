module.exports = function (router: any) {
  router.post("/update/myStake", async (req: any, res: any) => {
    if (
      !req.body.stakingContractAddress ||
      !req.body.tokenContractAddress ||
      !req.body.stakeHolderWalletAddress ||
      !req.body.stakedAmount ||
      !req.body.rewardAmount ||
      !req.body.action ||
      !req.body.amount
    ) {
      return res.http400(
        "stakingContractAddress,tokenContractAddress, stakeHolderWalletAddress, stakedAmount, rewardAmount and action are required."
      );
    }

    let stakingContractAddress = await db.StakingsContractsAddresses.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $unwind: {
          path: "$currencyAddressesByNetwork",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "currencyAddressesByNetwork",
          localField: "currencyAddressByNetwork",
          foreignField: "_id",
          as: "currencyAddressesByNetwork",
        },
      },
      {
        $unwind: {
          path: "$currencyAddressesByNetwork",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "currencyAddressesByNetwork.tokenContractAddress":
            req.body.tokenContractAddress,
        },
      },
    ]);
    if (stakingContractAddress.length > 0) {
      let stakingGrowth =
        await db.StakingLeaderboardGrowthTracker.findOneAndUpdate(
          {
            stakingContract: stakingContractAddress[0]._id,
            stakeHolderWalletAddress: req.body.stakeHolderWalletAddress,
          },
          {},
          { upsert: true, new: true }
        );

      if (req.body.action === "stakeIncrease") {
        req.body.stakedAmount =
          Number(req.body.stakedAmount) + Number(req.body.amount);
      } else if (req.body.action === "stakeWithDrawn") {
        req.body.stakedAmount =
          Number(req.body.stakedAmount) - Number(req.body.amount);
      } else if (req.body.action === "rewardWithDrawn") {
        req.body.rewardAmount =
          Number(req.body.rewardAmount) - Number(req.body.amount);
      }

      let a = await db.StakingLeaderboardHoldingsTracker.findOneAndUpdate(
        {
          stakingLeaderboardGrowthTracker: stakingGrowth._id,
          tokenContractAddress: req.body.tokenContractAddress,
        },
        {
          stakedAmount: req.body.stakedAmount,
          rewardAmount: req.body.rewardAmount,
        },
        { upsert: true, new: true }
      );
      return res.http200(
        `Staked amount for ${req.body.stakeHolderWalletAddress} has been updated`
      );
    }
    return res.http404("staking contract address not found");
  });
};
