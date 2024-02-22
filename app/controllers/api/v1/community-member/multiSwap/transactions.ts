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
      swapAndWithdrawTransaction: swapTransactionHelper.toObject(
        swapAndWithdrawTransaction
      ),
    });
  });

  router.put(
    "/regenerate/swap/and/withdraw/:txId",
    asyncMiddleware(async (req: any, res: any) => {
      let sourceNetwork = null;
      let destinationNetwork = null;
      let transactionStatusForSupport = "";
      let resopnseMessage = stringHelper.strSuccess;
      let onChainStatus = "";
      sourceNetwork = await db.Networks.findOne({
        chainId: req?.query?.chainId,
      });
      if (!sourceNetwork) {
        return res.http400(stringHelper.chainIdNotSupported);
      }
      let receipt = await getTransactionReceipt(
        req.params.txId,
        sourceNetwork.rpcUrl
      );
      if (receipt && receipt?.status != null && receipt?.status == true) {
        onChainStatus = stringHelper.strSuccess.toLowerCase();
        let decodedDtata: any = await swapTransactionHelper.getDecodedData(
          receipt.logs,
          sourceNetwork.rpcUrl
        );
        destinationNetwork = await db.Networks.findOne({
          chainId: decodedDtata?.targetChainId,
        });
        let response =
          await swapTransactionHelper.hanldeTransactionSuccessForRegenerate(
            sourceNetwork,
            destinationNetwork,
            decodedDtata,
            req.params.txId
          );
        resopnseMessage = response?.message;
        transactionStatusForSupport = response?.status;
      } else {
        let response =
          await swapTransactionHelper.hanldeTransactionFailedForRegenerate(
            receipt
          );
        resopnseMessage = response?.message;
        transactionStatusForSupport = response?.status;
        onChainStatus = response?.onChainStatus;
      }
      await swapTransactionHelper.sendSlackNotifcationForRegenerate(
        req.params.txId,
        onChainStatus,
        transactionStatusForSupport
      );
      return res.http200({
        message: resopnseMessage,
        onChainStatus: onChainStatus,
        systemStatus: transactionStatusForSupport,
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
            "withdrawTransactions.transactionId": {
              $in: req.query.transactionHash,
            },
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
        swapAndWithdrawTransactions:
          swapTransactionHelper.toArrayObject(transactions),
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
        swapAndWithdrawTransaction:
          swapTransactionHelper.toObject(transactions),
      });
    })
  );
};
