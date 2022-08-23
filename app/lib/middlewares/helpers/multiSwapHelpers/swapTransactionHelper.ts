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
    let receipt = await web3.getTransactionReceipt(txId);

    if (!receipt) {
      return {
        code: 401
      };
    }

    if (!receipt.status) {
      // need to move this error in phrase
      return {
        code: 400,
        data: `Transaction "${txId}" is failed`
      };
    }

    let swapLog = receipt.logs.find((l: any) => contractAddress.toLocaleLowerCase() === (l.address || '').toLocaleLowerCase()); // Index for the swap event
    let bridgeSwapInputs = web3ConfigurationHelper.getBridgeSwapInputs();

    if (!swapLog) {
      return {
        code: 400,
        data: stringHelper.strLogsNotFound + ' ' + txId
      };
    }

    let decoded = web3.abi.decodeLog(bridgeSwapInputs.inputs, swapLog.data, swapLog.topics.slice(1));

    if (!decoded) {
      return {
        code: 401
      };
    }

    return this.parseSwapEvent(network, { returnValues: decoded, transactionHash: txId }, receipt);
  },

  async parseSwapEvent(fromNetwork: any, e: any, receipt: any) {
    let decoded = e.returnValues;
    let toNetwork = await db.Networks.findOne({ chainId: decoded.targetNetwork });

    if (toNetwork.chainId == fromNetwork.chainId) {
      return {
        code: 400,
        data: stringHelper.strSameNetwork
      };
    }

    let fromCabn = { tokenContractAddress: decoded.token.toLowerCase() };
    let toCabn = { tokenContractAddress: decoded.targetToken.toLowerCase() };
    let amount = await web3Helper.amountToHuman_(fromNetwork, fromCabn, decoded.amount);


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
      status: !!receipt.status ? 'successful' : 'failed'
    }

    return {
      code: 200,
      data: returnObject
    };
  },

  async swapTransactionHelper(swap: any, schemaVersion: string) {
    let isV12 = false;
    if (schemaVersion == '1.2') {
      isV12 = true;
    }
    let txSummary = await this.getTransactionSummary(swap.fromNetwork, swap.transactionId);
    console.log(txSummary);
    // isV12 is pending
    let payBySig = null;
    if (isV12) {
      payBySig = await signatureHelper.createSignedPaymentV2(swap);
    } else {
      payBySig = await signatureHelper.createSignedPaymentV1(swap);
    }
    console.log(payBySig);

    const newItem = {
      id: swap.transactionId,
      timestamp: new Date().valueOf(),
      receiveNetwork: swap.network,
      receiveCurrency: signatureHelper.toCurrency(swap.fromNetwork.networkShortName, swap.fromCabn.tokenContractAddress),
      receiveTransactionId: swap.transactionId,
      receiveAddress: swap.targetAddress,
      receiveAmount: swap.amount,
      payBySig,
      sendNetwork: swap.targetNetwork,
      sendAddress: swap.targetAddress,
      sendTimestamp: 0,
      sendCurrency: signatureHelper.toCurrency(swap.fromNetwork.networkShortName, swap.fromCabn.tokenContractAddress),
      sendAmount: swap.amount,
      originCurrency: signatureHelper.toCurrency(swap.fromNetwork.networkShortName, swap.fromCabn.tokenContractAddress),
      sendToCurrency: signatureHelper.toCurrency(swap.toNetwork.networkShortName, swap.toCabn.tokenContractAddress),

      used: '',
      useTransactions: [],
      // creator,
      execution: { status: '', transactions: [] },
      receiveTransactionTimestamp: txSummary.confirmationTime,
      v: 0,
      version: schemaVersion,
      signatures: 0,
    }

    // Update version specific fields
    if (isV12) {
      // newItem.payBySig.hash = NodeUtils.bridgeV12Hash(newItem);
    } else {
      newItem.payBySig.swapTxId = signatureHelper.bridgeV1Salt(newItem);
      newItem.payBySig.hash = signatureHelper.bridgeV1Hash(newItem);
    }
  },

  async getTransactionSummary(fromNetwork: any, txId: string) {
    let web3 = web3ConfigurationHelper.web3(fromNetwork.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);

    if (!transaction) {
      return null;
    }

    console.log('transaction', transaction);
    const block = await web3.getBlockNumber();
    const txBlock = await web3.getBlock(transaction.blockNumber, false);

    return {
      confirmationTime: Number(txBlock.timestamp || '0') * 1000,
      confirmations: (block - txBlock.number) + 1
    }

  },
}
