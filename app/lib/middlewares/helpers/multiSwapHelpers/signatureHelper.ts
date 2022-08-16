import Web3 from 'web3';
var { Big } = require("big.js");

module.exports = {

  async createSignedPaymentV1(address: any, fromNetwork: any, transaction: any) {
    let fromChainId = fromNetwork.chainId;
    console.log(fromChainId, fromChainId);
    // let amountRaw = await web3Helper.amountToMachine(fromNetwork, fromCabn, transaction.amount);

    // const params = {
		// 	contractName: 'FERRUM_TOKEN_BRIDGE_POOL',
		// 	contractVersion: BridgeContractVersions.V1_0,
		// 	method: 'WithdrawSigned',
		// 	args: [
		// 		{ type: 'address', name: 'token', value: tx.targetToken },
		// 		{ type: 'address', name: 'payee', value: tx.targetAddress },
		// 		{ type: 'uint256', name: 'amount', value: amountStr },
		// 		{ type: 'address', name: 'toToken', value: tx.swapTargetTokenTo },
		// 		{ type: 'uint32', name: 'sourceChainId', value: sourceChainId },
		// 		{ type: 'bytes32', name: 'swapTxId', value: tx.transactionId },
		// 	]
		// };

    return null;
  },

  toCurrency(networkShortName: string, address: string): string | undefined {
    if (!networkShortName || !address) return null;
    return `${networkShortName.toUpperCase()}:${address.toLowerCase()}`
  }
}
