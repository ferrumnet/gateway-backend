const { db, asyncMiddleware, stakingTrackerHelper } = global;

module.exports = function (router) {
  router.post("/update/myStake", async (req, res) => {
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

    const cabn = await db.CurrencyAddressesByNetwork.findOne({
      tokenContractAddress: req.body.tokenContractAddress,
    });
    if (cabn) {
      let filter = {
        stakingContractAddress: req.body.stakingContractAddress,
        currencyAddressesByNetwork: cabn._id,
      };
      const stakingParticipantsCount = await db.StakingsTracker.countDocuments(
        filter
      );
      if (stakingParticipantsCount < 1) {
        await stakingTrackerHelper.intiatParticipentsData(
          cabn._id,
          req.body.stakingContractAddress
        );
      }

      const query = {
        stakingContractAddress: req.body.stakingContractAddress,
        stakeHolderWalletAddress: req.body.stakeHolderWalletAddress,
        tokenContractAddress: req.body.tokenContractAddress,
      };
      const options = { upsert: true };

      let stake = await db.StakingsTracker.findOne(query);
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
      const totalStakedAmount = stake
        ? Number(stake.totalStakedAmount) + Number(stake.stakedAmount)
        : Number(req.body.stakedAmount);
      const update = {
        $set: {
          stakedAmount: req.body.stakedAmount,
          rewardAmount: req.body.rewardAmount,
          totalStakedAmount,
          user: req.user._id,
        },
      };
      await db.StakingsTracker.updateOne(query, update, options);

      if (
        req.body.action === "stakeIncrease" ||
        req.body.action === "stakeWithDrawn"
      ) {
        await stakingTrackerHelper.calculate(
          cabn._id,
          req.body.stakingContractAddress
        );
      }
      return res.http200("Record updated successfully");
    }
    return res.http404("CABN not found");
  });
};
