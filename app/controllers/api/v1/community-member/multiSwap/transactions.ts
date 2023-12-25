var mongoose = require("mongoose");
import {
  getTransactionReceipt,
  getLogsFromTransactionReceipt,
  isValidSwapTransaction,
} from "../../../../../helpers/web3Helpers/web3Utils";
import { postMultiswapAlertIntoChannel } from "../../../../../lib/httpCalls/slackAxiosHelper";

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

  router.post(
    "/regenerate/swap/and/withdraw/:txId",
    asyncMiddleware(async (req: any, res: any) => {
      var filter: any = {};
      let transaction = null;
      let sourceNetwork = null;
      let destinationNetwork = null;
      let isShowInformationForSupport: boolean = false;
      let informationForSupport: any = {
        swapHash: "",
        sourceChainId: "",
        status: "",
        destinationChaindId: "",
      };
      const DIFF_IN_MINUTES = 3;

      let resopnseMessage = "success";
      let onChianStatus = "pending";
      let systemPreviousStatus = "";
      let systemCurrentStatus = "";

      filter.receiveTransactionId = req.params.txId;

      if (!req.query.chainId) {
        return res.http400("chainId is required.");
      }

      sourceNetwork = await db.Networks.findOne({
        chainId: req?.query?.chainId,
      });

      if (!sourceNetwork) {
        return res.http400("Network not supported.");
      }

      let receipt = await getTransactionReceipt(
        req.params.txId,
        sourceNetwork.rpcUrl
      );

      if (receipt && receipt?.status != null && receipt?.status == true) {
        onChianStatus = "success";
        let data = {
          logs: receipt.logs,
          rpcUrl: sourceNetwork.rpcUrl,
          isDestinationNonEVM: false,
        };
        let decodedDtata: any = await getLogsFromTransactionReceipt(data);
        console.log("decodedDtata isDestinationNonEVM=false", decodedDtata);
        if (!decodedDtata) {
          data.isDestinationNonEVM = true;
          decodedDtata = await getLogsFromTransactionReceipt(data);
          console.log("decodedDtata isDestinationNonEVM=true", decodedDtata);
        }

        informationForSupport.swapHash = req.params.txId;
        informationForSupport.sourceChainId = decodedDtata?.sourceChainId;
        informationForSupport.destinationChaindId = decodedDtata?.targetChainId;

        destinationNetwork = await db.Networks.findOne({
          chainId: decodedDtata?.targetChainId,
        });

        if (
          (await isValidSwapTransaction(
            sourceNetwork,
            destinationNetwork,
            decodedDtata,
            req.params.txId
          )) &&
          destinationNetwork
        ) {
          isShowInformationForSupport = true;
          console.log("1");
          transaction = await db.SwapAndWithdrawTransactions.findOne(filter)
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

          if (transaction) {
            informationForSupport.status = transaction.status;
            console.log("transactions", transaction.status);
            if (
              (global as any).helper.diffInMinuts(
                new Date(),
                transaction.updatedAt
              ) > DIFF_IN_MINUTES
            ) {
              if (
                transaction?.status ==
                utils.swapAndWithdrawTransactionStatuses.swapPending
              ) {
                resopnseMessage =
                  await commonFunctions.getValueFromStringsPhrase(
                    stringHelper.transactionFailedMessageOne
                  );
                transaction.nodeJob.id = "";
                transaction.nodeJob.status =
                  utils.swapAndWithdrawTransactionJobStatuses.pending;
                transaction.nodeJob.updatedAt = new Date();
                transaction.updatedAt = new Date();
                console.log(transaction?.nodeJob);
                // await db.SwapAndWithdrawTransactions.findOneAndUpdate(
                //   filter,
                //   transactions,
                //   { new: true }
                // );
              } else if (
                transaction?.status ==
                utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted
              ) {
                // swap and witdraw completed
                resopnseMessage =
                  await commonFunctions.getValueFromStringsPhrase(
                    stringHelper.withdrawlSuccessfulMessage
                  );
              } else {
                // swap should be proceed manually
                resopnseMessage =
                  await commonFunctions.getValueFromStringsPhrase(
                    stringHelper.transactionFailedMessageTwo
                  );
              }
            } else {
              // swap is generator less then 3 minutes
              resopnseMessage = await commonFunctions.getValueFromStringsPhrase(
                stringHelper.transactionFailedMessageOne
              );
            }
          } else {
            // swap does not exist in our system
            resopnseMessage = await commonFunctions.getValueFromStringsPhrase(
              stringHelper.transactionFailedMessageTwo
            );
          }
        } else {
          // swap is not from our contract
          resopnseMessage = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.invalidHashMessage
          );
        }
      } else {
        // swap might not be on the chain or swap is failed
        if (receipt == null) {
          // swap is on pending status / it can be fail or success
          resopnseMessage = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.transactionFailedMessageOne
          );
        } else if (receipt?.status == false) {
          // swap is failed on chain
          onChianStatus = "failed";
          resopnseMessage = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.swapFailedMessage
          );
          informationForSupport.status = "onChainStatusFailed";
        }
      }

      let text = `swapHash: ${req.params.txId}\nonChianStatus: ${onChianStatus}\nsystemPreviousStatus: ${informationForSupport.status}\nsystemCurrentStatus: ${informationForSupport.status}\n========================`;
      console.log("text", text);
      // await postMultiswapAlertIntoChannel({
      //   text: text,
      // });

      return res.http200({
        message: resopnseMessage,
      });
    })
  );

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
};
