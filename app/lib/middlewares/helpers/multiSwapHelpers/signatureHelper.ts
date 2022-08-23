import Web3 from 'web3';
var { Big } = require("big.js");

module.exports = {

	async createSignedPaymentV1(swap: any) {
		let amountStr = await web3Helper.amountToMachine(swap.toNetwork, swap.toCabn, swap.amount);
		console.log('amountStr', amountStr);
		const params = {
			contractName: 'FERRUM_TOKEN_BRIDGE_POOL',
			contractVersion: utils.bridgeContractVersions.V1_0,
			method: 'WithdrawSigned',
			args: [
				{ type: 'address', name: 'token', value: swap.toToken },
				{ type: 'address', name: 'payee', value: swap.toAddress },
				{ type: 'uint256', name: 'amount', value: amountStr },
				{ type: 'address', name: 'toToken', value: swap.toToken },
				{ type: 'uint32', name: 'sourceChainId', value: swap.fromNetwork.chainId },
				{ type: 'bytes32', name: 'swapTxId', value: swap.transactionId },
			]
		};

		return {
			token: swap.toToken,
			payee: swap.toAddress,
			amount: amountStr,
			toToken: swap.toToken,
			sourceChainId: swap.fromNetwork.chainId,
			swapTxId: '',
			contractName: params.contractName,
			contractVersion: params.contractVersion,
			contractAddress: swap.fromNetwork.contractAddress,
			hash: '',
			signatures: [],
		}
	},

	async createSignedPaymentV12(swap: any) {

		let amountStr = await web3Helper.amountToMachine(swap.toNetwork, swap.toCabn, swap.amount);
		const params = {
			contractName: 'FERRUM_TOKEN_BRIDGE_POOL',
			contractVersion: utils.bridgeContractVersions.V1_2,
			method: 'WithdrawSigned',
			args: [
				{ type: 'address', name: 'token', value: swap.toToken },
				{ type: 'address', name: 'payee', value: swap.toAddress },
				{ type: 'uint256', name: 'amount', value: amountStr },
				{ type: 'address', name: 'toToken', value: swap.toToken },
				{ type: 'uint32', name: 'sourceChainId', value: swap.fromNetwork.chainId },
				{ type: 'bytes32', name: 'swapTxId', value: swap.transactionId },
			]
		};

		return {
			token: swap.toToken,
			payee: swap.toAddress,
			amount: amountStr,
			toToken: swap.toToken,
			sourceChainId: swap.fromNetwork.chainId,
			swapTxId: '',
			contractName: params.contractName,
			contractVersion: params.contractVersion,
			contractAddress: swap.fromNetwork.contractAddress,
			hash: '',
			signatures: [],
		}
	},

	bridgeV1Salt(item: any) {
		return Web3.utils.keccak256(
			item.receiveTransactionId.toLocaleLowerCase()
		);
	},

	bridgeV1Hash(item: any, swap: any){
        const params = {
            contractName: item.payBySig.contractName,
            contractVersion: item.payBySig.contractVersion,
            method: "WithdrawSigned",
            args: [
                { type: "address", name: "token", value: item.payBySig.token },
                { type: "address", name: "payee", value: item.payBySig.payee },
                { type: "uint256", name: "amount", value: item.payBySig.amount },
                { type: "bytes32", name: "salt", value: this.bridgeV1Salt(item) },
            ],
        };

        // const sig = Eip712.produceSignature(
        //     new Web3().eth,
        //     swap.fromNetwork.chainId,
        //     item.payBySig.contractAddress,
        //     params
        // );
        // return sig.hash!;
    },

	toCurrency(networkShortName: string, address: string) {
		if (!networkShortName || !address) return null;
		return `${networkShortName.toUpperCase()}:${address.toLowerCase()}`
	}
}
