import moment from "moment";

module.exports = function (router: any) {
  router.post("/create", async (req: any, res: any) => {
    if (
      !req.body.tokenAddress ||
      !req.body.rewardTokenAddress ||
      !req.body.stakingCapital ||
      !req.body.stakingStarts ||
      !req.body.stakingEnds ||
      !req.body.withdrawStarts ||
      !req.body.withdrawEnds
    ) {
      return res.http400(
        "Token Address & Staking Capital & Staking Starts & Staking Ends & Withdraw Starts & Withdraw Ends are required."
      );
    }

    const staking = await db.Stakings.create(req.body);

    return res.http200({
      staking,
    });
  });

  router.patch("/:id/deploy", async (req: any, res: any) => {
    // console.log("params", req.params.id);
    if (!req.params.id) {
      return res.http400("Staking id is required.");
    }
    try {
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      const storageAppId = await stakingHelper.deployStorageApp();
      const result = await stakingHelper.deployContract(
        staking.tokenAddress,
        staking.rewardTokenAddress,
        staking.stakingCapital,
        staking.stakingStarts,
        staking.stakingEnds,
        staking.withdrawStarts,
        staking.withdrawEnds,
        staking._id,
        storageAppId
      );
      Object.assign(staking, {
        ...staking.toObject(),
        ...result,
        status: "DEPLOY",
        storageAppId,
      });
      await staking.save();
    } catch (e) {
      console.log(e);
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      Object.assign(staking, {
        ...staking,
        status: "FAIL_DEPLOY",
      });
      await staking.save();
      return res.http400({
        error: e,
      });
    }
    // console.log("Result: ", result);
    // await stakingHelper.setup(staking.tokenAddress, staking.stakingCapital);

    return res.http200({});
  });

  router.patch("/:id/setup", async (req: any, res: any) => {
    // console.log("params", req.params.id);
    try {
      if (!req.params.id) {
        return res.http400("Staking id is required.");
      }
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      await stakingHelper.setup(
        staking.tokenAddress,
        staking.rewardTokenAddress,
        staking.appId
      ); //staking.encodedAddress
      Object.assign(staking, {
        ...staking,
        status: "SETUP",
      });
      await staking.save();
    } catch (e) {
      console.log(e);
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      Object.assign(staking, {
        ...staking,
        status: "FAIL_SETUP",
      });
      await staking.save();
      return res.http400({
        error: e,
      });
    }
    return res.http200({});
  });

  router.patch("/:id/add-reward", async (req: any, res: any) => {
    // console.log("params", req.params.id);
    try {
      if (!req.params.id) {
        return res.http400("Staking id is required.");
      }
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      await stakingHelper.addReward(
        staking.rewardTokenAddress,
        staking.encodedAddress,
        req.body.rewardAmount,
        req.body.withdrawableAmount,
        staking.appId
      ); //staking.encodedAddress
      Object.assign(staking, {
        ...staking,
        status: "REWARD",
        rewardAmount: req.body.rewardAmount,
        withdrawableAmount: req.body.withdrawableAmount,
      });
      await staking.save();
    } catch (e) {
      console.log(e);
      const staking = await db.Stakings.findOne({ _id: req.params.id });
      Object.assign(staking, {
        ...staking,
        status: "FAIL_REWARD",
      });
      await staking.save();
      return res.http400(e);
    }
    return res.http200({});
  });

  router.get("/list", async (req: any, res: any) => {
    const stakings = await db.Stakings.find().sort({ createdAt: -1 });

    return res.http200({
      stakings,
    });
  });

  router.get("/:id", async (req: any, res: any) => {
    const staking = await db.Stakings.findOne({ _id: req.params.id });
    return res.http200({
      ...staking,
      stakingStarts: moment(staking.stakingStarts).format(
        "yyyy-MM-DD HH:mm:ss.SSS"
      ),
      stakingEnds: moment(staking.stakingEnds).format(
        "yyyy-MM-DD HH:mm:ss.SSS"
      ),
      withdrawStarts: moment(staking.withdrawStarts).format(
        "yyyy-MM-DD HH:mm:ss.SSS"
      ),
      withdrawEnds: moment(staking.withdrawEnds).format(
        "yyyy-MM-DD HH:mm:ss.SSS"
      ),
    });
  });
};
