import Web3 from 'web3';
var { Big } = require("big.js");
let TRANSACTION_TIMEOUT = 36 * 1000;
const abiDecoder = require('abi-decoder'); // NodeJS

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
      console.log(decodedData);
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

}
