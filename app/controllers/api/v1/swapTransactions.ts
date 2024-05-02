module.exports = function (router: any) {
  router.post("/:id", async (req: any, res: any) => {
    let network = await db.Networks.findOne({ _id: req.body.network });
    return res.http200({
      transaction: await web3Helper.getTransaction(network, req.params.id),
    });
  });

  router.post("/get/fees", async (req: any, res: any) => {
    let network = await db.Networks.findOne({ _id: req.body.network });
    return res.http200({
      transaction: await web3Helper.getFeesUsingWeb3(network),
    });
  });

  router.get("/transactions/list", async (req: any, res: any) => {
    const filter: any = {};
    if (req.query.search) {
      const reg = new RegExp(req.query.search, "i");
      filter.$or = [
        { receiveTransactionId: reg },
        { "withdrawTransactions.transactionId": reg },
        { sourceWalletAddress: reg },
        { destinationWalletAddress: reg },
      ];
    }
    let swapAndWithdrawTransactions = await db.SwapAndWithdrawTransactions.find(
      filter
    )
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .sort({ createdAt: -1 })
      .select(
        "-payBySig -execution -nodeJob -generatorSig -withdrawalSig -validatorSig -nodeJobs"
      )
      .populate("sourceNetwork")
      .populate("destinationNetwork")
      .populate({
        path: "sourceCabn",
        populate: {
          path: "currency",
          model: "currencies",
        },
      })
      .populate("destinationCabn")
      .populate({
        path: "destinationCabn",
        populate: {
          path: "currency",
          model: "currencies",
        },
      });
    let totalCounts = await db.SwapAndWithdrawTransactions.countDocuments(
      filter
    );
    return res.http200({ swapAndWithdrawTransactions, totalCounts });
  });
};
