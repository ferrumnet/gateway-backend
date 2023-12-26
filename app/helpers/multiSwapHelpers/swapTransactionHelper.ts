import Web3 from "web3";
var { Big } = require("big.js");
let TRANSACTION_TIMEOUT = 36 * 1000;
const abiDecoder = require("abi-decoder"); // NodeJS
var mongoose = require("mongoose");

module.exports = {
  async getTransactionByTxIdUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);
    return transaction;
  },

  async getTransactionReceiptByTxIdUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let receipt = await this.getTransactionReceipt(txId, web3);
    console.log("swap receipt::", receipt);
    if (!receipt) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    }

    if (!receipt.status) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is failed`);
    }

    console.log("status::::: ", receipt.status);

    // let swapLog = receipt.logs.find((l: any) => contractAddress.toLocaleLowerCase() === (l.address || '').toLocaleLowerCase()); // Index for the swap event
    // let bridgeSwapInputs = web3ConfigurationHelper.getBridgeSwapInputs();

    // need to discuss this thing
    // if (!swapLog) {
    //   return standardStatuses.status401(stringHelper.strLogsNotFound + ' ' + txId);
    // }

    // let decoded = web3.abi.decodeLog(bridgeSwapInputs.inputs, swapLog.data, swapLog.topics.slice(1));

    // if (!decoded) {
    //   // need to move this error in phrase
    //   return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    // }

    return this.parseSwapEvent(txId, receipt);
  },

  async getTransactionReceiptReceiptForApi(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let receipt = await this.getTransactionReceipt(txId, web3);
    return receipt;
  },

  async parseSwapEvent(transactionHash: any, receipt: any) {
    let returnObject = {
      transactionId: transactionHash,
      status: !!receipt.status ? "swapCompleted" : "swapFailed",
    };
    return standardStatuses.status200(returnObject);
  },

  async swapTransactionSummary(fromNetwork: any, swap: any) {
    let txSummary = await this.getTransactionSummary(
      fromNetwork,
      swap.transactionId
    );
    console.log("txSummary", txSummary);

    let newItem = {
      timestamp: new Date().valueOf(),
      receiveTransactionId: swap.transactionId,
      sourceTimestamp: 0,
      status: swap.status,
      useTransactions: [],
      execution: { status: "", transactions: [] },
      destinationTransactionTimestamp: txSummary.confirmationTime,
      v: 0,
      signatures: 0,
      sourceAmount: txSummary.sourceAmount,
      sourceWalletAddress: txSummary.sourceWalletAddress,
      destinationWalletAddress: txSummary.destinationWalletAddress,
    };
    return newItem;
  },

  async getTransactionSummary(fromNetwork: any, txId: string) {
    let data: any = {
      confirmationTime: 0,
      confirmations: 0,
      sourceAmount: null,
      sourceWalletAddress: null,
      destinationWalletAddress: null,
    };
    try {
      let block = null;
      let txBlock = null;
      let web3 = web3ConfigurationHelper.web3(fromNetwork.rpcUrl).eth;
      let transaction = await web3.getTransaction(txId);

      if (transaction) {
        data.sourceAmount = await this.getValueFromWebTransaction(
          transaction,
          "amountIn"
        );
        if (!data.sourceAmount) {
          data.sourceAmount = await this.getValueFromWebTransaction(
            transaction,
            "amount"
          );
        }
        data.sourceWalletAddress = transaction.from;
        data.destinationWalletAddress = await this.getValueFromWebTransaction(
          transaction,
          "targetAddress"
        );
        if (data.sourceWalletAddress) {
          data.sourceWalletAddress = data.sourceWalletAddress.toLowerCase();
        }
        if (data.destinationWalletAddress) {
          data.destinationWalletAddress =
            data.destinationWalletAddress.toLowerCase();
        }
        block = await web3.getBlockNumber();
        txBlock = await web3.getBlock(transaction.blockNumber, false);
        data.confirmationTime = Number(txBlock.timestamp || "0") * 1000;
      }
    } catch (e) {
      console.log(e);
    }
    return data;
  },

  async getTransactionReceipt(txId: any, web3: any) {
    let receipt = await web3.getTransactionReceipt(txId);

    return receipt;
  },

  async getValueFromWebTransaction(transaction: any, paramName: any) {
    let amount = null;
    if (transaction) {
      abiDecoder.addABI(web3ConfigurationHelper.getfiberAbi());
      const decodedData = await abiDecoder.decodeMethod(transaction.input);
      if (decodedData && decodedData.params && decodedData.params.length > 0) {
        for (let item of decodedData.params || []) {
          console.log(item.name);
          if (item && item.name == paramName) {
            if (item.value) {
              return item.value;
            }
          }
        }
      }
    }
    return amount;
  },

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
      utils.swapAndWithdrawTransactionStatuses.swapPending
    ) {
      swapAndWithdrawTransaction = await this.createGeneratorNodeJob(
        req,
        swapAndWithdrawTransaction
      );
    }

    // if (
    //   swapAndWithdrawTransaction?.status ==
    //   utils.swapAndWithdrawTransactionStatuses.generatorSignatureCreated
    // ) {
    //   swapAndWithdrawTransaction = await this.createValidatorNodeJob(
    //     req,
    //     swapAndWithdrawTransaction
    //   );
    // }

    // if (
    //   swapAndWithdrawTransaction?.status ==
    //   utils.swapAndWithdrawTransactionStatuses.validatorSignatureCreated
    // ) {
    //   swapAndWithdrawTransaction = await this.createMasterNodeJob(
    //     req,
    //     swapAndWithdrawTransaction
    //   );
    // }

    // if (
    //   swapAndWithdrawTransaction?.status ==
    //   utils.swapAndWithdrawTransactionStatuses.swapCompleted
    // ) {
    //   withdrawTransactionHelper.doWithdrawSignedFromFIBER(
    //     req,
    //     swapAndWithdrawTransaction
    //   );
    // }
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

  async createNodeJobs(req: any, swapAndWithdrawTransactionObject: any) {
    let filter: any = {};
    filter._id = swapAndWithdrawTransactionObject._id;

    if (!swapAndWithdrawTransactionObject) {
      throw "Invalid operation";
    }

    if (
      swapAndWithdrawTransactionObject.nodeJob.status ==
      utils.swapAndWithdrawTransactionJobStatuses.pending
    ) {
      let jobId = await multiswapNodeAxiosHelper.createJobBySwapHash(
        req,
        swapAndWithdrawTransactionObject
      );
      console.log("doSwapAndWithdraw jobId", jobId);
      if (jobId) {
        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        swapAndWithdrawTransactionObject.nodeJob.id = jobId;
        swapAndWithdrawTransactionObject.nodeJob.status =
          utils.swapAndWithdrawTransactionJobStatuses.created;
        swapAndWithdrawTransactionObject.nodeJob.createdAt = new Date();
        swapAndWithdrawTransactionObject.nodeJob.updatedAt = new Date();
        swapAndWithdrawTransactionObject =
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            filter,
            swapAndWithdrawTransactionObject,
            { new: true }
          );
      }
    }
    return swapAndWithdrawTransactionObject;
  },

  async createGeneratorNodeJob(
    req: any,
    swapAndWithdrawTransactionObject: any
  ) {
    let updateFilter: any = {};
    updateFilter._id = swapAndWithdrawTransactionObject._id;

    let countFilter: any = {};
    countFilter._id = swapAndWithdrawTransactionObject._id;
    countFilter.nodeJobs = {
      $elemMatch: { type: utils.nodeTypes.generator },
    };

    if (!swapAndWithdrawTransactionObject) {
      throw "Invalid operation";
    }
    let count = await db.SwapAndWithdrawTransactions.countDocuments(
      countFilter
    );
    console.log("createGeneratorNodeJob", count);

    if (count == 0) {
      let isCreated: boolean =
        await multiswapNodeAxiosHelper.createGeneratorJobBySwapHash(
          swapAndWithdrawTransactionObject
        );
      console.log("doSwapAndWithdraw isCreated", isCreated);
      if (isCreated) {
        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        let nodeJob = {
          type: utils.nodeTypes.generator,
          status: utils.swapAndWithdrawTransactionJobStatuses.created,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        swapAndWithdrawTransactionObject.nodeJobs.push(nodeJob);
        swapAndWithdrawTransactionObject =
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            updateFilter,
            swapAndWithdrawTransactionObject,
            { new: true }
          );
      }
    }
    return swapAndWithdrawTransactionObject;
  },

  async createValidatorNodeJob(
    req: any,
    swapAndWithdrawTransactionObject: any
  ) {
    let updateFilter: any = {};
    updateFilter._id = swapAndWithdrawTransactionObject._id;

    let countFilter: any = {};
    countFilter._id = swapAndWithdrawTransactionObject._id;
    countFilter.nodeJobs = {
      $elemMatch: { type: utils.nodeTypes.validator },
    };

    if (!swapAndWithdrawTransactionObject) {
      throw "Invalid operation";
    }
    let count = await db.SwapAndWithdrawTransactions.countDocuments(
      countFilter
    );
    console.log("createValidatorNodeJob", count);

    if (count == 0) {
      let isCreated: boolean =
        await multiswapNodeAxiosHelper.createValidatorJobsBySwapHash(
          swapAndWithdrawTransactionObject
        );
      console.log("doSwapAndWithdraw isCreated", isCreated);
      if (isCreated) {
        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        let nodeJob = {
          type: utils.nodeTypes.validator,
          status: utils.swapAndWithdrawTransactionJobStatuses.created,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        swapAndWithdrawTransactionObject.nodeJobs.push(nodeJob);
        swapAndWithdrawTransactionObject =
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            updateFilter,
            swapAndWithdrawTransactionObject,
            { new: true }
          );
      }
    }
    return swapAndWithdrawTransactionObject;
  },

  async createMasterNodeJob(req: any, swapAndWithdrawTransactionObject: any) {
    let updateFilter: any = {};
    updateFilter._id = swapAndWithdrawTransactionObject._id;

    let countFilter: any = {};
    countFilter._id = swapAndWithdrawTransactionObject._id;
    countFilter.nodeJobs = {
      $elemMatch: { type: utils.nodeTypes.master },
    };

    if (!swapAndWithdrawTransactionObject) {
      throw "Invalid operation";
    }
    let count = await db.SwapAndWithdrawTransactions.countDocuments(
      countFilter
    );
    console.log("createMasterNodeJob", count);

    if (count == 0) {
      let isCreated: boolean =
        await multiswapNodeAxiosHelper.createMasterJobBySwapHash(
          swapAndWithdrawTransactionObject
        );
      console.log("doSwapAndWithdraw isCreated", isCreated);
      if (isCreated) {
        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        let nodeJob = {
          type: utils.nodeTypes.master,
          status: utils.swapAndWithdrawTransactionJobStatuses.created,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        swapAndWithdrawTransactionObject.nodeJobs.push(nodeJob);
        swapAndWithdrawTransactionObject =
          await db.SwapAndWithdrawTransactions.findOneAndUpdate(
            updateFilter,
            swapAndWithdrawTransactionObject,
            { new: true }
          );
      }
    }
    return swapAndWithdrawTransactionObject;
  },

  async filterTransactionDetail(
    swapAndWithdrawTransaction: any,
    transaction: any
  ) {
    let data: any = { sourceAmount: null, destinationAmount: null };
    try {
      if (transaction) {
        swapAndWithdrawTransaction.sourceAmount =
          await this.getValueFromWebTransaction(transaction, "amountIn");
        if (!data.sourceAmount) {
          data.sourceAmount = await this.getValueFromWebTransaction(
            transaction,
            "amount"
          );
        }
        data.destinationAmount = await this.getValueFromWebTransaction(
          transaction,
          "amountOutMin"
        );
        if (!data.destinationAmount) {
          data.destinationAmount = await this.getValueFromWebTransaction(
            transaction,
            "amount"
          );
        }

        swapAndWithdrawTransaction.sourceWalletAddress = transaction.from;
        swapAndWithdrawTransaction.destinationWalletAddress =
          await this.getValueFromWebTransaction(transaction, "targetAddress");
        if (swapAndWithdrawTransaction.sourceWalletAddress) {
          swapAndWithdrawTransaction.sourceWalletAddress =
            swapAndWithdrawTransaction.sourceWalletAddress.toLowerCase();
        }
        if (swapAndWithdrawTransaction.destinationWalletAddress) {
          swapAndWithdrawTransaction.destinationWalletAddress =
            swapAndWithdrawTransaction.destinationWalletAddress.toLowerCase();
        }

        if (data.sourceAmount) {
          swapAndWithdrawTransaction.sourceAmount =
            await swapUtilsHelper.amountToHuman_(
              swapAndWithdrawTransaction.sourceNetwork,
              swapAndWithdrawTransaction.sourceCabn,
              data.sourceAmount
            );
        }
      }
    } catch (e) {
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  },
};
