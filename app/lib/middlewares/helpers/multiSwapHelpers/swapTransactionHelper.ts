import Web3 from 'web3';
var { Big } = require("big.js");
let TRANSACTION_TIMEOUT = 36 * 1000;
const abiDecoder = require('abi-decoder'); // NodeJS
var mongoose = require('mongoose');

module.exports = {

  async getTransactionByTxIdUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);
    return transaction;
  },

  async getTransactionReceiptByTxIdUsingWeb3(network: any, txId: any) {

    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let receipt = await this.getTransactionReceipt(txId, web3);
    console.log('swap receipt::', receipt)
    if (!receipt) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    }

    if (!receipt.status) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is failed`);
    }

    console.log('status::::: ',receipt.status)

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
      status: !!receipt.status ? 'swapCompleted' : 'swapFailed'
    }
    return standardStatuses.status200(returnObject);

  },

  async swapTransactionSummary(fromNetwork: any, swap: any) {
    let txSummary = await this.getTransactionSummary(fromNetwork, swap.transactionId);
    console.log('txSummary',txSummary);
    
    let newItem = {
      timestamp: new Date().valueOf(),
      receiveTransactionId: swap.transactionId,
      sourceTimestamp: 0,
      status: swap.status,
      useTransactions: [],
      execution: { status: '', transactions: [] },
      destinationTransactionTimestamp: txSummary.confirmationTime,
      v: 0,
      signatures: 0,
      sourceAmount: txSummary.sourceAmount,
      sourceWalletAddress: txSummary.sourceWalletAddress,
      destinationWalletAddress: txSummary.destinationWalletAddress
    }
    return newItem;
  },

  async getTransactionSummary(fromNetwork: any, txId: string) {
    let data: any = {confirmationTime: 0, confirmations: 0, sourceAmount: null, sourceWalletAddress: null, destinationWalletAddress: null}
    try{
      let block = null;
      let txBlock = null;
      let web3 = web3ConfigurationHelper.web3(fromNetwork.rpcUrl).eth;
      let transaction = await web3.getTransaction(txId);
      
      if (transaction) {
        data.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amountIn');
        if(!data.sourceAmount){
          data.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amount');
        }
        data.sourceWalletAddress = transaction.from;
        data.destinationWalletAddress = await this.getValueFromWebTransaction(transaction, 'targetAddress');
        if(data.sourceWalletAddress){
          data.sourceWalletAddress = (data.sourceWalletAddress).toLowerCase();
        }
        if(data.destinationWalletAddress){
          data.destinationWalletAddress = (data.destinationWalletAddress).toLowerCase();
        }
        block = await web3.getBlockNumber();
        txBlock = await web3.getBlock(transaction.blockNumber, false);
        data.confirmationTime = Number(txBlock.timestamp || '0') * 1000;
      }
    }catch(e){
      console.log(e);
    }
    return data;
  },

  async getTransactionReceiptStatusByTxIdUsingWeb3(network: any, txId: any) {
    let receipt: any = {status: false};
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    receipt = await this.getTransactionReceipt(txId, web3);

    // need to discuss this thing
    // if (!receipt) {
    //   return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    // }
    // if (!receipt.status) {
    //   return standardStatuses.status400(`Transaction "${txId}" is failed`);
    // }
    
    console.log('status::::: ',receipt.status)
    receipt.status = !!receipt.status ? 'swapWithdrawCompleted' : 'swapWithdrawFailed'
    let transaction = await web3Helper.getTransaction(network, txId);
    receipt.destinationAmount = await this.getValueFromWebTransaction(transaction, 'amountOutMin');
    if(!receipt.destinationAmount){
      receipt.destinationAmount = await this.getValueFromWebTransaction(transaction, 'amount');
    }
    console.log(receipt.destinationAmount);
    return standardStatuses.status200(receipt);
  },

  async getTransactionReceipt(txId: any, web3: any) {

    let receipt = await web3.getTransactionReceipt(txId);

    return receipt;
  },

  async getValueFromWebTransaction(transaction: any, paramName: any) {
    let amount = null;
    if(transaction){
      abiDecoder.addABI(web3ConfigurationHelper.getfiberAbi());
      const decodedData = await abiDecoder.decodeMethod(transaction.input);
      if(decodedData && decodedData.params && decodedData.params.length > 0){
        for(let item of decodedData.params||[]){
          console.log(item.name);
          if(item && item.name == paramName){
            if(item.value){
              return item.value;
            }

          }
        }
      }
    }
    return amount;
  },

  validationForDoSwapAndWithdraw(req: any) {
    if (!req.params.swapTxId || !req.query.sourceNetworkId || !req.query.destinationNetworkId
      || !req.query.sourceCabnId || !req.query.destinationCabnId) {
      throw 'swapTxId & sourceNetworkId & destinationNetworkId & sourceCabnId & destinationCabnId are required.';
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      throw 'Invalid sourceNetworkId';
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.destinationNetworkId)) {
      throw 'Invalid destinationNetworkId';
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceCabnId)) {
      throw 'Invalid sourceCabnId';
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.destinationCabnId)) {
      throw 'Invalid destinationCabnId';
    }
  },

  async doSwapAndWithdraw(req: any, swapAndWithdrawTransaction: any) {
    if(swapAndWithdrawTransaction && swapAndWithdrawTransaction.status == utils.swapAndWithdrawTransactionStatuses.swapPending && 
      swapAndWithdrawTransaction.nodeJob.status == utils.swapAndWithdrawTransactionJobStatuses.pending){
        swapAndWithdrawTransaction = await this.createJobInsideSwapAndWithdraw(req, swapAndWithdrawTransaction);
    }

    if(swapAndWithdrawTransaction && swapAndWithdrawTransaction.status == utils.swapAndWithdrawTransactionStatuses.swapCompleted 
      && swapAndWithdrawTransaction.nodeJob && swapAndWithdrawTransaction.nodeJob.status == utils.swapAndWithdrawTransactionJobStatuses.completed){
        withdrawTransactionHelper.doWithdrawSignedFromFIBER(req, swapAndWithdrawTransaction);
    }
    return swapAndWithdrawTransaction;
  },

  async createPendingSwap(req: any) {
    let filter: any = {};
    let swapAndWithdrawTransaction = null;
    filter.createdByUser = req.user._id;
    filter.receiveTransactionId = req.params.swapTxId;
    let count = await db.SwapAndWithdrawTransactions.countDocuments(filter)
    if(count > 0){
      let oldSwapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.findOne({receiveTransactionId: req.params.swapTxId});
      return oldSwapAndWithdrawTransaction;
    }
    let sourceCabn = await db.CurrencyAddressesByNetwork.findOne({_id: req.query.sourceCabnId});
    let destinationCabn = await db.CurrencyAddressesByNetwork.findOne({_id: req.query.destinationCabnId});
    req.query.sourceCabn = sourceCabn? sourceCabn.tokenContractAddress : '';
    req.query.destinationCabn = destinationCabn? destinationCabn.tokenContractAddress : '';

    let sourceNetwork = await db.Networks.findOne({_id: req.query.sourceNetworkId});
    let destinationNetwork = await db.Networks.findOne({_id: req.query.destinationNetworkId});
    req.query.sourceNetwork = sourceNetwork? sourceNetwork.chainId : '';
    req.query.destinationNetwork = destinationNetwork? destinationNetwork.chainId : '';

    let tokenQuoteInformation = await withdrawTransactionHelper.getTokenQuoteInformationFromFIBER(req);
    console.log('tokenQuoteInformation',tokenQuoteInformation);
    if(tokenQuoteInformation && tokenQuoteInformation.data 
      && tokenQuoteInformation.data.destinationTokenCategorizedInfo
      && tokenQuoteInformation.data.destinationTokenCategorizedInfo.destinationAmount){
        req.query.bridgeAmount = tokenQuoteInformation.data.destinationTokenCategorizedInfo.bridgeAmount;
        let body: any = {};
        body.sourceAssetType = tokenQuoteInformation.data.sourceTokenCategorizedInfo.type;
        body.destinationAssetType = tokenQuoteInformation.data.destinationTokenCategorizedInfo.type;
        body.receiveTransactionId = req.params.swapTxId;
        body.sourceAmount = req.query.sourceAmount;
        body.bridgeAmount = req.query.bridgeAmount;
        body.version = 'v2';
        body.createdByUser = req.user._id;
        body.updatedByUser = req.user._id;
        body.createdAt = new Date();
        body.updatedAt = new Date();
        body.sourceCabn = req.query.sourceCabnId;
        body.destinationCabn = req.query.destinationCabnId;
        body.sourceNetwork = req.query.sourceNetworkId;
        body.destinationNetwork = req.query.destinationNetworkId;
        body.status = utils.swapAndWithdrawTransactionStatuses.swapPending;
        console.log('doSwapAndWithdraw pendingObject', body);
        swapAndWithdrawTransaction = await db.SwapAndWithdrawTransactions.create(body);
    }
    return swapAndWithdrawTransaction;
  },

  async createJobInsideSwapAndWithdraw(req: any, swapAndWithdrawTransactionObject: any) {
    let filter: any = {};
    filter._id = swapAndWithdrawTransactionObject._id;

    if(!swapAndWithdrawTransactionObject){
      throw 'Invalid operation';
    }

    if(swapAndWithdrawTransactionObject.nodeJob.status == utils.swapAndWithdrawTransactionJobStatuses.pending){
      let jobId = await multiswapNodeAxiosHelper.createJobBySwapHash(req, swapAndWithdrawTransactionObject);
      console.log('doSwapAndWithdraw jobId',jobId);
      if(jobId){
        swapAndWithdrawTransactionObject.updatedByUser = req.user._id;
        swapAndWithdrawTransactionObject.updatedAt = new Date();
        swapAndWithdrawTransactionObject.nodeJob.id = jobId;
        swapAndWithdrawTransactionObject.nodeJob.status = utils.swapAndWithdrawTransactionJobStatuses.created;
        swapAndWithdrawTransactionObject.nodeJob.createdAt = new Date();
        swapAndWithdrawTransactionObject.nodeJob.updatedAt = new Date();
        swapAndWithdrawTransactionObject = await db.SwapAndWithdrawTransactions.findOneAndUpdate(filter, swapAndWithdrawTransactionObject, { new: true }); 
      }
    }
    return swapAndWithdrawTransactionObject;
  },

  async filterTransactionDetail(swapAndWithdrawTransaction: any, transaction: any) {
    let data: any = { sourceAmount: null, destinationAmount: null };
    try{
      if (transaction) {
        swapAndWithdrawTransaction.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amountIn');
        if(!data.sourceAmount){
          data.sourceAmount = await this.getValueFromWebTransaction(transaction, 'amount');
        }
        data.destinationAmount = await this.getValueFromWebTransaction(transaction, 'amountOutMin');
        if (!data.destinationAmount) {
          data.destinationAmount = await this.getValueFromWebTransaction(transaction, 'amount');
        }

        swapAndWithdrawTransaction.sourceWalletAddress = transaction.from;
        swapAndWithdrawTransaction.destinationWalletAddress = await this.getValueFromWebTransaction(transaction, 'targetAddress');
        if(swapAndWithdrawTransaction.sourceWalletAddress){
          swapAndWithdrawTransaction.sourceWalletAddress = (swapAndWithdrawTransaction.sourceWalletAddress).toLowerCase();
        }
        if(swapAndWithdrawTransaction.destinationWalletAddress){
          swapAndWithdrawTransaction.destinationWalletAddress = (swapAndWithdrawTransaction.destinationWalletAddress).toLowerCase();
        }

        if(data.sourceAmount){
          swapAndWithdrawTransaction.sourceAmount = await swapUtilsHelper.amountToHuman_(swapAndWithdrawTransaction.sourceNetwork, swapAndWithdrawTransaction.sourceCabn, data.sourceAmount);
        }
      }
    }catch(e){
      console.log(e);
    }
    return swapAndWithdrawTransaction;
  },

}
