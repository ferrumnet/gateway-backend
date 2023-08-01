var mongoose = require("mongoose");

module.exports = function (router: any) {
  router.post("/do/swap/and/withdraw/:swapTxId", async (req: any, res: any) => {
    swapTransactionHelper.validationForDoSwapAndWithdraw(req);
    req.sourceNetwork = await db.Networks.findOne({
      _id: req.query.sourceNetworkId,
    });
    req.destinationNetwork = await db.Networks.findOne({
      _id: req.query.destinationNetworkId,
    });
    if (!req.sourceNetwork || !req.destinationNetwork) {
      throw "Invalid sourceNetwork or destinationNetwork";
    }
    let swapAndWithdrawTransaction =
      await swapTransactionHelper.createPendingSwap(req);
    swapAndWithdrawTransaction = await swapTransactionHelper.doSwapAndWithdraw(
      req,
      swapAndWithdrawTransaction
    );
    return res.http200({
      swapAndWithdrawTransaction: swapAndWithdrawTransaction,
    });
  });

  router.get(
    "/list",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let sort = { createdAt: -1 };
      let transactions = null;
      let totalCount = 0;

      filter.createdByUser = req.user._id;

      if (req.query.sourceNetwork) {
        filter.sourceNetwork = req.query.sourceNetwork;
      }

      if (req.query.transactionHash) {
        filter.$or = [
          {
            "useTransactions.transactionId": { $in: req.query.transactionHash },
          },
          { receiveTransactionId: req.query.transactionHash },
        ];
      }

      if (req.query.swapTransactionId) {
        filter.receiveTransactionId = req.query.swapTransactionId;
      }

      if (req.query.withdrawTransactionId) {
        let withdrawTrahsactionHashFilter = {
          "useTransactions.transactionId": {
            $in: req.query.withdrawTransactionId,
          },
        };
        filter = { ...withdrawTrahsactionHashFilter, ...filter };
      }

      console.log(filter);

      totalCount = await db.SwapAndWithdrawTransactions.countDocuments(filter);

      if (req.query.isPagination != null && req.query.isPagination == "false") {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate("destinationNetwork")
          .populate("sourceNetwork")
          .populate({
            path: "toCabn",
            populate: {
              path: "currency",
              model: "currencies",
            },
          })
          .populate({
            path: "fromCabn",
            populate: {
              path: "currency",
              model: "currencies",
            },
          })
          .sort(sort);
      } else {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate("networks")
          .populate("destinationNetwork")
          .populate("sourceNetwork")
          .populate({
            path: "destinationCabn",
            populate: {
              path: "currency",
              model: "currencies",
            },
          })
          .populate({
            path: "sourceCabn",
            populate: {
              path: "currency",
              model: "currencies",
            },
          })
          .sort(sort)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10);
      }

      return res.http200({
        swapAndWithdrawTransactions: transactions,
        totalCount: totalCount,
      });
    })
  );

  router.get(
    "/:txId",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let sort = { createdAt: -1 };
      let transactions = null;

      filter.receiveTransactionId = req.params.txId;

      transactions = await db.SwapAndWithdrawTransactions.findOne(filter)
        .populate("destinationNetwork")
        .populate("sourceNetwork")
        .populate({
          path: "destinationCabn",
          populate: {
            path: "currency",
            model: "currencies",
          },
        })
        .populate({
          path: "sourceCabn",
          populate: {
            path: "currency",
            model: "currencies",
          },
        });

      return res.http200({
        swapAndWithdrawTransaction: transactions,
      });
    })
  );

  router.get(
    "/info/statuses",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let swapPendingCount = 0;
      let swapCreatedCount = 0;
      let swapCompletedCount = 0;
      let swapFailedCount = 0;
      let swapWithdrawGeneratedCount = 0;
      let swapWithdrawPendingCount = 0;
      let swapWithdrawFailedCount = 0;
      let swapWithdrawCompletedCount = 0;

      filter.createdByUser = req.user._id;

      if (req.query.sourceNetwork) {
        filter.sourceNetwork = req.query.sourceNetwork;
      }

      swapPendingCount = await db.SwapAndWithdrawTransactions.countDocuments({
        ...filter,
        status: "swapPending",
      });
      swapCreatedCount = await db.SwapAndWithdrawTransactions.countDocuments({
        ...filter,
        status: "swapCreated",
      });
      swapCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({
        ...filter,
        status: "swapCompleted",
      });
      swapFailedCount = await db.SwapAndWithdrawTransactions.countDocuments({
        ...filter,
        status: "swapFailed",
      });
      swapWithdrawGeneratedCount =
        await db.SwapAndWithdrawTransactions.countDocuments({
          ...filter,
          status: "swapWithdrawGenerated",
        });
      swapWithdrawPendingCount =
        await db.SwapAndWithdrawTransactions.countDocuments({
          ...filter,
          status: "swapWithdrawPending",
        });
      swapWithdrawFailedCount =
        await db.SwapAndWithdrawTransactions.countDocuments({
          ...filter,
          status: "swapWithdrawFailed",
        });
      swapWithdrawCompletedCount =
        await db.SwapAndWithdrawTransactions.countDocuments({
          ...filter,
          status: "swapWithdrawCompleted",
        });

      return res.http200({
        swapPendingCount,
        swapCreatedCount,
        swapCompletedCount,
        swapFailedCount,
        swapWithdrawGeneratedCount,
        swapWithdrawPendingCount,
        swapWithdrawFailedCount,
        swapWithdrawCompletedCount,
      });
    })
  );
};
