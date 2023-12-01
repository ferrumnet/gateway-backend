var mongoose = require("mongoose");
import {
  getTransactionReceipt,
  getLogsFromTransactionReceipt,
  isValidSwapTransaction,
} from "../../../../../lib/middlewares/helpers/web3Helpers/web3Utils";
import { postMultiswapAlertIntoChannel } from "../../../../../lib/httpCalls/slackAxiosHelper";

module.exports = function (router: any) {
  // need to retire this end point
  // router.post(
  //   "/create/:txId",
  //   asyncMiddleware(async (req: any, res: any) => {
  //     let address = null;
  //     let sourceNetwork = null;
  //     let destinationNetwork = null;
  //     let swapTransaction = null;

  //     if (
  //       !req.params.txId ||
  //       !req.query.sourceNetworkId ||
  //       !req.query.destinationNetworkId
  //     ) {
  //       return res.http400(
  //         "txId & sourceNetworkId & destinationNetworkId are required."
  //       );
  //     }

  //     if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
  //       return res.http400("Invalid sourceNetworkId");
  //     }

  //     if (!mongoose.Types.ObjectId.isValid(req.query.destinationNetworkId)) {
  //       return res.http400("Invalid destinationNetworkId");
  //     }

  //     let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({
  //       receiveTransactionId: req.params.txId,
  //     });
  //     if (oldSwapTransaction) {
  //       return res.http200({
  //         swapAndWithdrawTransaction: oldSwapTransaction,
  //       });
  //     }

  //     if (req.user) {
  //       address = await db.Addresses.findOne({ user: req.user._id });
  //     }

  //     sourceNetwork = await db.Networks.findOne({
  //       _id: req.query.sourceNetworkId,
  //     });
  //     destinationNetwork = await db.Networks.findOne({
  //       _id: req.query.destinationNetworkId,
  //     });
  //     if (sourceNetwork) {
  //       req.query.smartContractAddress =
  //         await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(
  //           sourceNetwork._id,
  //           "#fiberFund"
  //         );
  //     }

  //     if (address) {
  //       let receipt = null;
  //       if (sourceNetwork.isNonEVM != null && sourceNetwork.isNonEVM == true) {
  //         receipt = await nonEvmHelper.getTransactionReceiptByTxIdUsingCosmWasm(
  //           sourceNetwork,
  //           req.params.txId
  //         );
  //       } else {
  //         receipt =
  //           await swapTransactionHelper.getTransactionReceiptByTxIdUsingWeb3(
  //             sourceNetwork,
  //             req.params.txId
  //           );
  //       }

  //       if (receipt.code == 401) {
  //         return res.http400(
  //           await commonFunctions.getValueFromStringsPhrase(receipt.message),
  //           receipt.message
  //         );
  //       } else if (receipt.code == 400) {
  //         return res.http400(receipt.message);
  //       }

  //       receipt = receipt.data;
  //       receipt.sourceSmartContractAddress = req.query.smartContractAddress;
  //       let sourceCabn = await db.CurrencyAddressesByNetwork.findOne({
  //         _id: req.query.sourceCabn,
  //       });
  //       let destinationCabn = await db.CurrencyAddressesByNetwork.findOne({
  //         _id: req.query.destinationCabn,
  //       });
  //       if (receipt) {
  //         if (
  //           sourceNetwork.isNonEVM != null &&
  //           sourceNetwork.isNonEVM == true
  //         ) {
  //           swapTransaction = await nonEvmHelper.swapTransactionSummary(
  //             sourceNetwork,
  //             receipt,
  //             req
  //           );
  //         } else {
  //           swapTransaction =
  //             await swapTransactionHelper.swapTransactionSummary(
  //               sourceNetwork,
  //               receipt
  //             );
  //           if (swapTransaction.sourceAmount) {
  //             swapTransaction.sourceAmount =
  //               await swapUtilsHelper.amountToHuman_(
  //                 sourceNetwork,
  //                 sourceCabn,
  //                 swapTransaction.sourceAmount
  //               );
  //           }
  //         }
  //       }

  //       if (req.query.destinationWalletAddress) {
  //         swapTransaction.destinationWalletAddress =
  //           req.query.destinationWalletAddress.toLowerCase();
  //       }

  //       if (swapTransaction) {
  //         console.log(
  //           "swapTransaction.sourceAmount",
  //           swapTransaction.sourceAmount
  //         );
  //         console.log(sourceNetwork?._id);
  //         console.log(destinationNetwork?._id);
  //         swapTransaction.sourceNetwork = sourceNetwork?._id;
  //         swapTransaction.destinationNetwork = destinationNetwork?._id;
  //         swapTransaction.destinationCabn = destinationCabn?._id;
  //         swapTransaction.sourceSmartContractAddress =
  //           req.query.smartContractAddress;
  //         swapTransaction.sourceCabn = sourceCabn?._id;
  //         swapTransaction.createdByUser = req.user._id;
  //         swapTransaction.createdAt = new Date();
  //         swapTransaction.updatedAt = new Date();
  //         swapTransaction = await db.SwapAndWithdrawTransactions.create(
  //           swapTransaction
  //         );
  //         return res.http200({
  //           swapAndWithdrawTransaction: swapTransaction,
  //         });
  //       }
  //     }

  //     return res.http400("Invalid txId, sourceNetwork or smartContractAddress");
  //   })
  // );

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

      // response messages
      let failedMessageOne =
        "Transaction is currently in progress. Please wait!. If transaction does not proceed in next 5 minutes, please contact support.";
      let failedMessageTwo =
        "We are having trouble processing the Transaction, please contact support to proceed further.";
      let invalidHashMessage = "Swap unsuccessful due to invalid hash.";
      let swapFailedMessage = "Swap transaction has failed.";
      let withdrawlSuccessfulMessage = "Transaction withdrawal successful.";

      filter.receiveTransactionId = req.params.txId;

      if (!req.query.chainId) {
        return res.http400("chainId is required.");
      }

      sourceNetwork = await db.Networks.findOne({
        chainId: req?.query?.chainId,
      });

      if (!sourceNetwork) {
        return res.http400("Invalid chainId.");
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
                transaction.createdAt
              ) > DIFF_IN_MINUTES &&
              (global as any).helper.diffInMinuts(
                new Date(),
                transaction?.nodeJob?.createdAt
              ) > DIFF_IN_MINUTES
            ) {
              if (
                transaction?.status ==
                utils.swapAndWithdrawTransactionStatuses.swapPending
              ) {
                resopnseMessage = failedMessageOne;
                transaction.nodeJob.id = "";
                transaction.nodeJob.status =
                  utils.swapAndWithdrawTransactionJobStatuses.pending;
                transaction.nodeJob.updatedAt = new Date();
                console.log(transaction?.nodeJob);
                // await db.SwapAndWithdrawTransactions.findOneAndUpdate(
                //   filter,
                //   transactions,
                //   { new: true }
                // );
              } else if (
                transaction?.status ==
                utils.swapAndWithdrawTransactionStatuses.swapPending
              ) {
                // swap and witdraw completed
                resopnseMessage = withdrawlSuccessfulMessage;
              } else {
                // swap should be proceed manually
                resopnseMessage = failedMessageTwo;
              }
            } else {
              // swap is generator less then 3 minutes
              resopnseMessage = failedMessageOne;
            }
          } else {
            // swap does not exist in our system
            resopnseMessage = failedMessageTwo;
          }
        } else {
          // swap is not from our contract
          resopnseMessage = invalidHashMessage;
        }
      } else {
        // swap might not be on the chain or swap is failed
        if (receipt == null) {
          // swap is on pending status / it can be fail or success
          resopnseMessage = failedMessageOne;
        } else if (receipt?.status == false) {
          // swap is failed on chain
          onChianStatus = "failed";
          resopnseMessage = swapFailedMessage;
          informationForSupport.status = "onChainStatusFailed";
        }
      }

      let text = `swapHash: ${req.params.txId}\nonChianStatus: ${onChianStatus}\nsystemPreviousStatus: ${informationForSupport.status}\nsystemCurrentStatus: ${informationForSupport.status}`;
      console.log("text", text);
      // await postMultiswapAlertIntoChannel({
      //   text: text,
      // });

      return res.http200({
        message: resopnseMessage,
        isShowInformationForSupport: isShowInformationForSupport,
        informationForSupport: informationForSupport,
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

  // router.get(
  //   "/info/statuses",
  //   asyncMiddleware(async (req: any, res: any) => {
  //     var filter: any = {};
  //     let swapPendingCount = 0;
  //     let swapCreatedCount = 0;
  //     let swapCompletedCount = 0;
  //     let swapFailedCount = 0;
  //     let swapWithdrawGeneratedCount = 0;
  //     let swapWithdrawPendingCount = 0;
  //     let swapWithdrawFailedCount = 0;
  //     let swapWithdrawCompletedCount = 0;

  //     filter.createdByUser = req.user._id;

  //     if (req.query.sourceNetwork) {
  //       filter.sourceNetwork = req.query.sourceNetwork;
  //     }

  //     swapPendingCount = await db.SwapAndWithdrawTransactions.countDocuments({
  //       ...filter,
  //       status: "swapPending",
  //     });
  //     swapCreatedCount = await db.SwapAndWithdrawTransactions.countDocuments({
  //       ...filter,
  //       status: "swapCreated",
  //     });
  //     swapCompletedCount = await db.SwapAndWithdrawTransactions.countDocuments({
  //       ...filter,
  //       status: "swapCompleted",
  //     });
  //     swapFailedCount = await db.SwapAndWithdrawTransactions.countDocuments({
  //       ...filter,
  //       status: "swapFailed",
  //     });
  //     swapWithdrawGeneratedCount =
  //       await db.SwapAndWithdrawTransactions.countDocuments({
  //         ...filter,
  //         status: "swapWithdrawGenerated",
  //       });
  //     swapWithdrawPendingCount =
  //       await db.SwapAndWithdrawTransactions.countDocuments({
  //         ...filter,
  //         status: "swapWithdrawPending",
  //       });
  //     swapWithdrawFailedCount =
  //       await db.SwapAndWithdrawTransactions.countDocuments({
  //         ...filter,
  //         status: "swapWithdrawFailed",
  //       });
  //     swapWithdrawCompletedCount =
  //       await db.SwapAndWithdrawTransactions.countDocuments({
  //         ...filter,
  //         status: "swapWithdrawCompleted",
  //       });

  //     return res.http200({
  //       swapPendingCount,
  //       swapCreatedCount,
  //       swapCompletedCount,
  //       swapFailedCount,
  //       swapWithdrawGeneratedCount,
  //       swapWithdrawPendingCount,
  //       swapWithdrawFailedCount,
  //       swapWithdrawCompletedCount,
  //     });
  //   })
  // );
  // need to retire this end point
  // router.put('/update/status/:txId', asyncMiddleware(async (req: any, res: any) => {

  //   let address = null;
  //   let sourceNetwork = null;
  //   let destinationNetwork = null;

  //   if (!req.params.txId || !req.body.withdrawTxId) {
  //     return res.http400('txId and withdrawTxId required.');
  //   }

  //   let oldSwapTransaction = await db.SwapAndWithdrawTransactions.findOne({receiveTransactionId: req.params.txId}).populate('sourceNetwork').populate('destinationNetwork').populate('sourceCabn').populate('destinationCabn');

  //   if (req.user) {
  //     address = await db.Addresses.findOne({ user: req.user._id });
  //   }

  //   sourceNetwork = oldSwapTransaction.sourceNetwork;
  //   destinationNetwork = oldSwapTransaction.destinationNetwork;

  //   if(sourceNetwork){
  //     req.query.smartContractAddress = await smartContractHelper.getSmartContractAddressByNetworkIdAndTag(destinationNetwork._id, '#fiberFund');
  //   }

  //   if (address && sourceNetwork && oldSwapTransaction) {

  //     let receipt = null;
  //     if(destinationNetwork.isNonEVM != null && destinationNetwork.isNonEVM == true){
  //       receipt = await nonEvmHelper.getTransactionReceiptByTxIdUsingCosmWasm(destinationNetwork, req.body.withdrawTxId);
  //     }else {
  //       receipt = await swapTransactionHelper.getTransactionReceiptStatusByTxIdUsingWeb3(destinationNetwork, req.body.withdrawTxId);
  //     }

  //     if(receipt.code == 401){
  //       return res.http400(await commonFunctions.getValueFromStringsPhrase(receipt.message), receipt.message);
  //     }else if (receipt.code == 400){
  //       return res.http400(receipt.message);
  //     }
  //     oldSwapTransaction.destinationSmartContractAddress = req.query.smartContractAddress;
  //     receipt = receipt.data;

  //     if(destinationNetwork.isNonEVM != null && destinationNetwork.isNonEVM == true){
  //       receipt = await nonEvmHelper.withdrawTransactionSummary(receipt, req);
  //       oldSwapTransaction.destinationAmount = receipt.destinationAmount;
  //     }else {
  //       if(receipt.destinationAmount){
  //         oldSwapTransaction.destinationAmount = await swapUtilsHelper.amountToHuman_(destinationNetwork, oldSwapTransaction.destinationCabn, receipt.destinationAmount);
  //       }
  //     }
  //     if(receipt.status == 'swapWithdrawFailed'){
  //       oldSwapTransaction.status = 'swapWithdrawFailed'
  //     }else if(receipt.status == 'swapWithdrawCompleted'){
  //       oldSwapTransaction.status = 'swapWithdrawCompleted'
  //     }else {
  //       oldSwapTransaction.status = 'swapWithdrawPending'
  //     }

  //     let useTransaction = {
  //       transactionId: req.body.withdrawTxId,
  //       status: receipt.status,
  //       timestamp: new Date()
  //     }

  //     if(oldSwapTransaction.useTransactions && oldSwapTransaction.useTransactions.length > 0){
  //       let txItem = (oldSwapTransaction.useTransactions || []).find((t:any) => t.transactionId === req.body.withdrawTxId);
  //       if(!txItem){
  //         oldSwapTransaction.useTransactions.push(useTransaction);
  //       }
  //     }else {
  //       oldSwapTransaction.useTransactions.push(useTransaction);
  //     }

  //     await db.SwapAndWithdrawTransactions.findOneAndUpdate({_id: oldSwapTransaction._id}, oldSwapTransaction);

  //     return res.http200({
  //       swapAndWithdrawTransaction: oldSwapTransaction
  //     })
  //   }

  //   return res.http400('Invalid txId, withdrawTxId or smartContractAddress');

  // }));
  // need to retire this end point
  // router.get('/receipt/by/hash/:txId', asyncMiddleware(async (req: any, res: any) => {

  //   let sourceNetwork = null;
  //   let receipt = null;
  //   if (!req.params.txId || !req.query.sourceNetworkId) {
  //     return res.http400('txId & sourceNetworkId are required.');
  //   }

  //   if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
  //     return res.http400('Invalid sourceNetworkId');
  //   }

  //   sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId });

  //   if(sourceNetwork.isNonEVM != null && sourceNetwork.isNonEVM == true){
  //     receipt = await nonEvmHelper.getTransactionByHash(req.params.txId,sourceNetwork.rpcUrl);
  //   }else {
  //     receipt = await swapTransactionHelper.getTransactionReceiptReceiptForApi(sourceNetwork, req.params.txId);
  //   }

  //   return res.http200({
  //     receipt: receipt
  //   })

  // }));
};
