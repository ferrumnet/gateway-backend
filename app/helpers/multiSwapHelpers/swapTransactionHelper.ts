var mongoose = require("mongoose");
import {
  getLogsFromTransactionReceipt,
  isValidSwapTransaction,
} from "../../helpers/web3Helpers/web3Utils";
import { postMultiswapAlertIntoChannel } from "../../lib/httpCalls/slackAxiosHelper";

module.exports = {
  validationForDoSwapAndWithdraw(req: any) {
    if (
      !req.params.swapTxId ||
      !req.query.sourceNetworkId ||
      !req.query.destinationNetworkId ||
      !req.query.sourceCabnId ||
      !req.query.destinationCabnId ||
      !req.body.sourceAssetType ||
      !req.body.destinationAssetType
    ) {
      throw "swapTxId & sourceNetworkId & destinationNetworkId & sourceCabnId & destinationCabnId & sourceAssetType & destinationAssetType are required.";
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      throw "Invalid sourceNetworkId";
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.destinationNetworkId)) {
      throw "Invalid destinationNetworkId";
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId)) {
      throw "Invalid sourceCabnId";
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.destinationCabnId)) {
      throw "Invalid destinationCabnId";
    }
  },

  async doSwapAndWithdraw(req: any, swapAndWithdrawTransaction: any) {
    if (
      swapAndWithdrawTransaction?.status ==
      utils.swapAndWithdrawTransactionStatuses.swapCompleted
    ) {
      withdrawTransactionHelper.doWithdrawSignedFromFIBER(
        req,
        swapAndWithdrawTransaction
      );
    }
    return swapAndWithdrawTransaction;
  },

  async createPendingSwap(req: any) {
    let filter: any = {};
    let swapAndWithdrawTransaction = null;
    filter.createdByUser = req.user._id;
    filter.receiveTransactionId = req.params.swapTxId;
    let count = await db.SwapAndWithdrawTransactions.countDocuments(filter);
    if (count == 0) {
      let sourceCabn = await db.CurrencyAddressesByNetwork.findOne({
        _id: req.query.sourceCabnId,
      });
      let destinationCabn = await db.CurrencyAddressesByNetwork.findOne({
        _id: req.query.destinationCabnId,
      });
      req.query.sourceCabn = sourceCabn ? sourceCabn.tokenContractAddress : "";
      req.query.destinationCabn = destinationCabn
        ? destinationCabn.tokenContractAddress
        : "";

      let sourceNetwork = await db.Networks.findOne({
        _id: req.query.sourceNetworkId,
      });
      let destinationNetwork = await db.Networks.findOne({
        _id: req.query.destinationNetworkId,
      });
      req.query.sourceNetwork = sourceNetwork ? sourceNetwork.chainId : "";
      req.query.destinationNetwork = destinationNetwork
        ? destinationNetwork.chainId
        : "";

      let body: any = {};
      body.receiveTransactionId = req.params.swapTxId;
      body.version = "v3";
      body.createdByUser = req.user._id;
      body.updatedByUser = req.user._id;
      body.createdAt = new Date();
      body.updatedAt = new Date();
      body.sourceCabn = req.query.sourceCabnId;
      body.destinationCabn = req.query.destinationCabnId;
      body.sourceNetwork = req.query.sourceNetworkId;
      body.destinationNetwork = req.query.destinationNetworkId;
      body.status = utils.swapAndWithdrawTransactionStatuses.swapPending;
      body = { ...body, ...req.body };
      console.log("doSwapAndWithdraw pendingObject", body);
      swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.create(
        body
      );
    }
    swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.findOne({
      receiveTransactionId: req.params.swapTxId,
    })
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
      });
    return swapAndWithdrawTransaction;
  },

  toArrayObject(data: any) {
    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        data[i] = this.toObject(data[i]);
      }
    }
    return data;
  },

  toObject(tx: any) {
    let rawObject = tx.toObject();
    delete rawObject?.generatorSig;
    delete rawObject?.validatorSig;
    delete rawObject?.withdrawalSig;
    delete rawObject?.nodeJobs;
    return rawObject;
  },

  getFilters(req: any) {
    var filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.address && req.query.nodeType == utils.nodeTypes.validator) {
      filter.validatorSig = {
        $not: { $elemMatch: { address: req.query.address } },
      };
    }
    filter.version = "v3";
    return filter;
  },

  async getDecodedData(logs: any, rpcUrl: string) {
    let data = {
      logs: logs,
      rpcUrl: rpcUrl,
      isDestinationNonEVM: false,
    };
    let decodedDtata: any = await getLogsFromTransactionReceipt(data);
    if (!decodedDtata) {
      data.isDestinationNonEVM = true;
      decodedDtata = await getLogsFromTransactionReceipt(data);
    }
    return decodedDtata;
  },

  async hanldeTransactionSuccessForRegenerate(
    sourceNetwork: any,
    destinationNetwork: any,
    decodedDtata: any,
    swapHash: string
  ) {
    let response = { message: "", status: "" };
    if (
      (await isValidSwapTransaction(
        sourceNetwork,
        destinationNetwork,
        decodedDtata,
        swapHash
      )) &&
      destinationNetwork
    ) {
      let res = await this.doTransactionOperationsForRegenerate(swapHash);
      response.message = res?.message;
      response.status = res?.status;
    } else {
      response.message = await commonFunctions.getValueFromStringsPhrase(
        stringHelper.invalidHashMessage
      );
    }
    return response;
  },

  async hanldeTransactionFailedForRegenerate(receipt: any) {
    let response = { message: "", status: "", onChainStatus: "pending" };
    if (receipt == null) {
      response.message = await commonFunctions.getValueFromStringsPhrase(
        stringHelper.transactionFailedMessageOne
      );
    } else if (receipt?.status == false) {
      response.onChainStatus = "failed";
      response.message = await commonFunctions.getValueFromStringsPhrase(
        stringHelper.swapFailedMessage
      );
      response.status = "onChainStatusFailed";
    }
    return response;
  },

  async doTransactionOperationsForRegenerate(swapHash: string) {
    const DIFF_IN_MINUTES = 5;
    let transaction = null;
    let response = { message: "", status: "" };
    transaction = await db.SwapAndWithdrawTransactions.findOne({
      receiveTransactionId: swapHash,
    })
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
      response.status = transaction.status;
      if (
        (global as any).helper.diffInMinuts(new Date(), transaction.updatedAt) >
        DIFF_IN_MINUTES
      ) {
        if (
          transaction?.status ==
          utils.swapAndWithdrawTransactionStatuses.generatorSignatureFailed
        ) {
          response.message = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.transactionFailedMessageOne
          );
          transaction.status =
            utils.swapAndWithdrawTransactionStatuses.swapPending;
          transaction.generatorSig.salt = "";
          transaction.updatedAt = new Date();
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            {
              receiveTransactionId: swapHash,
            },
            transaction,
            { new: true }
          );
        } else if (
          transaction?.status ==
          utils.swapAndWithdrawTransactionStatuses.swapWithdrawCompleted
        ) {
          response.message = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.withdrawlSuccessfulMessage
          );
        } else {
          response.message = await commonFunctions.getValueFromStringsPhrase(
            stringHelper.transactionFailedMessageTwo
          );
        }
      } else {
        response.message = await commonFunctions.getValueFromStringsPhrase(
          stringHelper.transactionFailedMessageOne
        );
      }
    } else {
      // swap does not exist in our system
      response.message = await commonFunctions.getValueFromStringsPhrase(
        stringHelper.transactionFailedMessageTwo
      );
    }
    return response;
  },

  async sendSlackNotifcationForRegenerate(
    swapHash: string,
    onChainStatus: string,
    transactionStatusForSupport: string
  ) {
    let text = `swapHash: ${swapHash}\nonChainStatus: ${onChainStatus}\nsystemPreviousStatus: ${transactionStatusForSupport}\nsystemCurrentStatus: ${transactionStatusForSupport}\n========================`;
    await postMultiswapAlertIntoChannel({
      text: text,
    });
  },
};
