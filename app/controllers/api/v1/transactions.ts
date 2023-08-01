var mongoose = require("mongoose");

module.exports = function (router: any) {
  router.put(
    "/update/swap/and/withdraw/job/:txHash",
    asyncMiddleware(async (req: any, res: any) => {
      commonFunctions.doAuthForNodeApis(req);

      if (req.query.isFrom == "fiber") {
        await handleFIBERRequest(req);
      } else {
        if (!req.params.txHash && req.body.signedData) {
          return res.http400("txHash & signedData are required.");
        }

        if (req.body.signatures && req.body.signatures.length == 0) {
          return res.http401("signatures can not be empty");
        }

        console.log("update swapAndWitdraw body", req.body);

        let swapAndWithdrawTransaction =
          await db.SwapAndWithdrawTransactions.findOne({
            receiveTransactionId: req.params.txHash,
            status: utils.swapAndWithdrawTransactionStatuses.swapPending,
          })
            .populate("sourceNetwork")
            .populate("destinationNetwork")
            .populate("sourceCabn")
            .populate("destinationCabn");

        if (req.body && swapAndWithdrawTransaction) {
          let transaction = req.body.transaction;
          let transactionReceipt = req?.body?.transactionReceipt;
          swapAndWithdrawTransaction.nodeJob.status =
            utils.swapAndWithdrawTransactionJobStatuses.completed;

          if (
            transactionReceipt?.status &&
            transactionReceipt?.status == true
          ) {
            swapAndWithdrawTransaction.status =
              utils.swapAndWithdrawTransactionStatuses.swapCompleted;
          } else {
            swapAndWithdrawTransaction.status =
              utils.swapAndWithdrawTransactionStatuses.swapFailed;
          }

          swapAndWithdrawTransaction = await getTransactionDetail(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
          swapAndWithdrawTransaction = getSignedData(
            swapAndWithdrawTransaction,
            req.body.signedData
          );
          swapAndWithdrawTransaction.nodeJob.updatedAt = new Date();
          swapAndWithdrawTransaction.updatedAt = new Date();
          swapAndWithdrawTransaction =
            await db.SwapAndWithdrawTransactions.findOneAndUpdate(
              { _id: swapAndWithdrawTransaction._id },
              swapAndWithdrawTransaction,
              { new: true }
            );
        }
      }
      return res.http200({
        message: stringHelper.strSuccess,
      });
    })
  );

  router.get(
    "/list",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let sort = { createdAt: -1 };
      let transactions = null;

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
      });
    })
  );

  async function getTransactionDetail(
    swapAndWithdrawTransaction: any,
    signedData: any
  ) {
    try {
      swapAndWithdrawTransaction.sourceWalletAddress = signedData.from;
      swapAndWithdrawTransaction.destinationWalletAddress =
        signedData.targetAddress;
      if (swapAndWithdrawTransaction.sourceNetwork.isNonEVM == false) {
        swapAndWithdrawTransaction.sourceAmount = signedData.amount;
        if (swapAndWithdrawTransaction.sourceAmount) {
          swapAndWithdrawTransaction.sourceAmount =
            await swapUtilsHelper.amountToHuman_(
              swapAndWithdrawTransaction.sourceNetwork,
              swapAndWithdrawTransaction.sourceCabn,
              swapAndWithdrawTransaction.sourceAmount
            );
        }
      }
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  function getSignedData(swapAndWithdrawTransaction: any, signedData: any) {
    try {
      swapAndWithdrawTransaction.payBySig.salt = signedData.salt;
      swapAndWithdrawTransaction.payBySig.hash = signedData.hash;
      swapAndWithdrawTransaction.payBySig.signatures = signedData.signatures;
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  }

  async function handleFIBERRequest(req: any) {
    try {
      if (req.body && req.params.txHash) {
        let withdrawData = req.body;
        if (withdrawData) {
          console.log("doSwapAndWithdraw withdrawHash", withdrawData);
          let swapAndWithdrawTransactionObject =
            await db.SwapAndWithdrawTransactions.findOne({
              receiveTransactionId: req.params.txHash,
            });

          let filter: any = {};
          filter._id = swapAndWithdrawTransactionObject._id;

          if (!swapAndWithdrawTransactionObject) {
            throw "Invalid operation";
          }

          let useTransaction = {
            transactionId: withdrawData.data,
            status:
              utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted,
            timestamp: new Date(),
          };

          if (
            swapAndWithdrawTransactionObject.useTransactions &&
            swapAndWithdrawTransactionObject.useTransactions.length > 0
          ) {
            let txItem = (
              swapAndWithdrawTransactionObject.useTransactions || []
            ).find((t: any) => t.transactionId === withdrawData.data);
            if (!txItem) {
              swapAndWithdrawTransactionObject.useTransactions.push(
                useTransaction
              );
            }
          } else {
            swapAndWithdrawTransactionObject.useTransactions.push(
              useTransaction
            );
          }

          if (withdrawData.withdraw.destinationAmount) {
            swapAndWithdrawTransactionObject.destinationAmount =
              withdrawData.withdraw.destinationAmount;
          }

          swapAndWithdrawTransactionObject.status =
            utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted;
          swapAndWithdrawTransactionObject.updatedAt = new Date();
          swapAndWithdrawTransactionObject =
            await db.SwapAndWithdrawTransactions.findOneAndUpdate(
              filter,
              swapAndWithdrawTransactionObject
            );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
};
