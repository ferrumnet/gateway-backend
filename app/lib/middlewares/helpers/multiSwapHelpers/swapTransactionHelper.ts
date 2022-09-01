import Web3 from 'web3';
var { Big } = require("big.js");
let TRANSACTION_TIMEOUT = 36 * 1000;

module.exports = {

  async getTransactionByTxIdUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);
    return transaction;
  },

  async getTransactionReceiptByTxIdUsingWeb3(network: any, txId: any, contractAddress: any) {

    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let receipt = await this.getTransactionReceipt(txId, web3);
    console.log('status::::: ',receipt.status)

    let swapLog = receipt.logs.find((l: any) => contractAddress.toLocaleLowerCase() === (l.address || '').toLocaleLowerCase()); // Index for the swap event
    let bridgeSwapInputs = web3ConfigurationHelper.getBridgeSwapInputs();

    if (!swapLog) {
      return standardStatuses.status401(stringHelper.strLogsNotFound + ' ' + txId);
    }

    let decoded = web3.abi.decodeLog(bridgeSwapInputs.inputs, swapLog.data, swapLog.topics.slice(1));

    if (!decoded) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    }

    return this.parseSwapEvent(network, { returnValues: decoded, transactionHash: txId }, receipt);
  },

  async parseSwapEvent(fromNetwork: any, e: any, receipt: any) {
    let decoded = e.returnValues;
    let toNetwork = await db.Networks.findOne({ chainId: decoded.targetNetwork });

    if (toNetwork.chainId == fromNetwork.chainId) {
      return standardStatuses.status401(stringHelper.strSameNetwork);
    }

    let fromCabn = { tokenContractAddress: decoded.token.toLowerCase() };
    let toCabn = { tokenContractAddress: decoded.targetToken.toLowerCase() };
    let amount = await swapUtilsHelper.amountToHuman_(fromNetwork, fromCabn, decoded.amount);

    console.log("decoded values::::::: ",decoded)
    let returnObject = {
      fromNetwork,
      toNetwork,
      fromCabn,
      toCabn,
      transactionId: e.transactionHash,
      fromAddress: decoded.from?.toLowerCase(),
      amount: amount,
      toAddress: (decoded.targetAddrdess || '').toLowerCase(),
      toNetworkShortName: toNetwork.networkShortName,
      toToken: (decoded.targetToken || '').toLowerCase(),
      token: (decoded.token || '').toLowerCase(),
      status: !!receipt.status ? 'swapCompleted' : 'swapFailed'
    }
    return standardStatuses.status200(returnObject);

  },

  async swapTransactionSummary(swap: any, schemaVersion: string) {
    let isV12 = false;
    if (schemaVersion == utils.expectedSchemaVersionV1_2) {
      isV12 = true;
    }
    let txSummary = await this.getTransactionSummary(swap.fromNetwork, swap.transactionId);
    console.log('txSummary',txSummary);
    
    let payBySig = null;
    if (isV12) {
      payBySig = await signatureHelper.createSignedPaymentV1_2(swap);
    } else {
      payBySig = await signatureHelper.createSignedPaymentV1_0(swap);
    }
    // console.log('payBySig::: ',payBySig);

    let newItem = {
      timestamp: new Date().valueOf(),
      receiveNetwork: swap.fromNetwork.networkShortName,
      receiveCurrency: signatureHelper.toCurrency(swap.fromNetwork.networkShortName, swap.fromCabn.tokenContractAddress),
      receiveTransactionId: swap.transactionId,
      receiveAddress: swap.toAddress,
      receiveAmount: swap.amount,
      payBySig,
      sendNetwork: swap.toNetwork.networkShortName,
      sendAddress: swap.toAddress,
      sendTimestamp: 0,
      sendCurrency: signatureHelper.toCurrency(swap.toNetwork.networkShortName, swap.toCabn.tokenContractAddress),
      sendAmount: swap.amount,

      used: '',
      status: swap.status,
      useTransactions: [],
      // creator,
      execution: { status: '', transactions: [] },
      receiveTransactionTimestamp: txSummary.confirmationTime,
      v: 0,
      version: schemaVersion,
      signatures: 0,
    }

    if (isV12) {
      newItem.payBySig.hash = signatureHelper.bridgeHashV1_2(newItem, swap);
    } else {
      newItem.payBySig.swapTxId = signatureHelper.bridgeSaltV1_0(newItem);
      newItem.payBySig.hash = signatureHelper.bridgeHashV1_0(newItem, swap);
    }

    return newItem;
  },

  async getTransactionSummary(fromNetwork: any, txId: string) {
    let web3 = web3ConfigurationHelper.web3(fromNetwork.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);

    if (!transaction) {
      return null;
    }

    const block = await web3.getBlockNumber();
    const txBlock = await web3.getBlock(transaction.blockNumber, false);

    return {
      confirmationTime: Number(txBlock.timestamp || '0') * 1000,
      confirmations: (block - txBlock.number) + 1
    }

  },

  async getTransactionReceipt(txId: any, web3: any) {

    let receipt = await web3.getTransactionReceipt(txId);

    if (!receipt) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is invalid`);
    }

    if (!receipt.status) {
      // need to move this error in phrase
      return standardStatuses.status400(`Transaction "${txId}" is failed`);
    }

    return receipt;
  },
}
