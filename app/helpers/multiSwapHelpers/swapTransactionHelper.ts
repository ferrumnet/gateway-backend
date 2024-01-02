import Web3 from "web3";
var { Big } = require("big.js");
let TRANSACTION_TIMEOUT = 36 * 1000;
const abiDecoder = require("abi-decoder"); // NodeJS
var mongoose = require("mongoose");

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
};
