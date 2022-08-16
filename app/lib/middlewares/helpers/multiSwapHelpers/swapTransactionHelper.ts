import Web3 from 'web3';
var { Big } = require("big.js");

module.exports = {

  async getTransactionByTxIdUsingWeb3(network: any, txId: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let transaction = await web3.getTransaction(txId);
    return transaction;
  },

  async getTransactionReceiptByTxIdUsingWeb3(network: any, txId: any,contractAddress: any) {
    let web3 = web3ConfigurationHelper.web3(network.rpcUrl).eth;
    let receipt = await web3.getTransactionReceipt(txId);
    let swapLog = receipt.logs.find((l: any) => contractAddress.toLocaleLowerCase() === (l.address || '').toLocaleLowerCase()); // Index for the swap event
    let bridgeSwapInputs = web3ConfigurationHelper.getBridgeSwapInputs();
    console.log("bridgeSwapInputs", bridgeSwapInputs);
    let decoded = web3.abi.decodeLog(bridgeSwapInputs.inputs, swapLog.data, swapLog.topics.slice(1));
    return this.parseSwapEvent(network, { returnValues: decoded, transactionHash: txId });
  },

  async parseSwapEvent(network: any, e: any) {
		let decoded = e.returnValues;
		let currency = `${network.networkShortName}:${decoded.token.toLowerCase()}`;
    console.log("currency", currency);
		// const targetNetworkName = Networks.forChainId(decoded.targetNetwork);
		// ValidationUtils.isTrue(network !==
		// 	targetNetworkName.id, 'to and from network are same!');
		// return {
		// 	network,
		// 	transactionId: e.transactionHash,
		// 	from: decoded.from?.toLowerCase(),
		// 	amount: await this.helper.amountToHuman(currency, decoded.amount),
		// 	targetAddress: (decoded.targetAddrdess || '').toLowerCase(), // I know, but typo is correct
		// 	targetNetwork: targetNetworkName.id,
		// 	targetToken: (decoded.targetToken || '').toLowerCase(),
		// 	token: (decoded.token || '').toLowerCase(),
		// };
	}
}
