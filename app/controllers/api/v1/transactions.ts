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
      commonFunctions.doAuthForNodeApis(req);
      if (req.query.status) {
        filter.status = req.query.status;
      }

      if (req.query.address) {
        filter.validatorSig = {
          $not: { $elemMatch: { address: req.query.address } },
        };
      }

      filter.version = "v3";

      console.log(filter);

      if (req.query.isPagination != null && req.query.isPagination == "false") {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .sort(sort);
      } else {
        transactions = await db.SwapAndWithdrawTransactions.find(filter)
          .populate({
            path: "destinationNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .populate({
            path: "sourceNetwork",
            populate: {
              path: "multiswapNetworkFIBERInformation",
              model: "multiswapNetworkFIBERInformations",
            },
          })
          .sort(sort)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10);
      }

      return res.http200({
        transactions: transactions,
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
      swapAndWithdrawTransaction.destinationBridgeAmount =
        signedData.swapBridgeAmount;
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

          if (req?.body?.responseCode && req?.body?.responseCode == 200) {
            let useTransaction = {
              transactionId: withdrawData.data,
              status:
                utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted,
              timestamp: new Date(),
            };

            if (
              swapAndWithdrawTransactionObject.withdrawTransactions &&
              swapAndWithdrawTransactionObject.withdrawTransactions.length > 0
            ) {
              let txItem = (
                swapAndWithdrawTransactionObject.withdrawTransactions || []
              ).find((t: any) => t.transactionId === withdrawData.data);
              if (!txItem) {
                swapAndWithdrawTransactionObject.withdrawTransactions.push(
                  useTransaction
                );
              }
            } else {
              swapAndWithdrawTransactionObject.withdrawTransactions.push(
                useTransaction
              );
            }
            if (withdrawData.withdraw.destinationAmount) {
              swapAndWithdrawTransactionObject.destinationAmount =
                withdrawData.withdraw.destinationAmount;
            }
            swapAndWithdrawTransactionObject.status =
              utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted;
          } else {
            swapAndWithdrawTransactionObject.status =
              utils.swapAndWithdrawTransactionStatuses.swapWithdrawFailed;
          }

          swapAndWithdrawTransactionObject.responseCode =
            req?.body?.responseCode;
          swapAndWithdrawTransactionObject.responseMessage =
            req?.body?.responseMessage;
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
