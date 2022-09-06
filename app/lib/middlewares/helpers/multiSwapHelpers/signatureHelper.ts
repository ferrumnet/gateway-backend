import { any } from 'bluebird';
import Web3 from 'web3';
var { Big } = require("big.js");
var toRpcSig = require("ethereumjs-util");

module.exports = {

	async createSignedPaymentV1_0(swap: any) {
		let amountStr = await swapUtilsHelper.amountToMachine(swap.toNetwork, swap.toCabn, swap.amount);
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
			// toToken: swap.toToken,
			sourceChainId: swap.fromNetwork.chainId,
			swapTxId: '',
			contractName: params.contractName,
			contractVersion: params.contractVersion,
			contractAddress: swap.toNetwork.contractAddress,
			hash: '',
			signatures: [],
		}
	},

	async createSignedPaymentV1_2(swap: any) {

		let amountStr = await swapUtilsHelper.amountToMachine(swap.toNetwork, swap.toCabn, swap.amount);
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
			swapTxId: swap.transactionId,
			contractName: params.contractName,
			contractVersion: params.contractVersion,
			contractAddress: swap.toNetwork.contractAddress,
			hash: '',
			signatures: [],
		}
	},

	bridgeSaltV1_0(item: any) {
		console.log('receiveTransactionId',item.receiveTransactionId)
		return Web3.utils.keccak256(
			item.receiveTransactionId.toLocaleLowerCase()
		);
	},

	bridgeHashV1_0(item: any, swap: any) {
		let params = {
			contractName: item.payBySig.contractName,
			contractVersion: item.payBySig.contractVersion,
			method: "WithdrawSigned",
			args: [
				{ type: "address", name: "token", value: item.payBySig.token },
				{ type: "address", name: "payee", value: item.payBySig.payee },
				{ type: "uint256", name: "amount", value: item.payBySig.amount },
				{ type: "bytes32", name: "salt", value: this.bridgeSaltV1_0(item) },
			],
		};
		console.log(params);

		let sig = this.produceSignature(
			new Web3().eth,
			swap.toNetwork.chainId,
			item.payBySig.contractAddress,
			params
		);
		return sig.hash!;
	},

	async createSignedPayment(item: any, swap: any) {

		let params = {
			contractName: item.payBySig.contractName,
			contractVersion: item.payBySig.contractVersion,
			method: "WithdrawSigned",
			args: [
				{ type: "address", name: "token", value: item.payBySig.token },
				{ type: "address", name: "payee", value: item.payBySig.payee },
				{ type: "uint256", name: "amount", value: item.payBySig.amount },
				{ type: "bytes32", name: "salt", value: this.bridgeSaltV1_0(item) },
			],
		};
		console.log(params);

		let sig2 = this.produceSignature(
			new Web3().eth,
			swap.toNetwork.chainId,
			item.payBySig.contractAddress,
			params
		);
		console.log(sig2)

		// const sigP = await this.chain
		// .forNetwork(network as any)
		// .sign(this.privateKey, payBySig.hash.replace("0x", ""), true);

		// const rpcSig = this.fixSig(
		// 	toRpcSig(baseV, Buffer.from(sigP.r, "hex"), Buffer.from(sigP.s, "hex"), 1)
		//   );
		// console.log(rpcSig)

		// return sig.hash!;
	},

	bridgeHashV1_2(item: any, swap: any) {
		let params = {
			contractName: item.payBySig.contractName,
			contractVersion: item.payBySig.contractVersion,
			method: 'WithdrawSigned',
			args: [
				{ type: 'address', name: 'token', value: item.payBySig.token },
				{ type: 'address', name: 'payee', value: item.payBySig.payee },
				{ type: 'uint256', name: 'amount', value: item.payBySig.amount },
				{ type: 'address', name: 'toToken', value: item.payBySig.toToken },
				{ type: 'uint32', name: 'sourceChainId', value: swap.fromNetwork.chainId },
				{ type: 'bytes32', name: 'swapTxId', value: item.payBySig.swapTxId },
			]
		};

		console.log(params);

		let sig = this.produceSignature(
			new Web3().eth,
			swap.toNetwork.chainId,
			item.payBySig.contractAddress,
			params);
		return sig.hash!;
	},

	toCurrency(networkShortName: string, address: string) {
		if (!networkShortName || !address) return null;
		return `${networkShortName.toUpperCase()}:${address.toLowerCase()}`
	},

	produceSignature(eth: any, netId: number, contractAddress: any, eipParams: any) {
		console.log(netId, contractAddress, eipParams);
		const methodSig = `${eipParams.method}(${eipParams.args.map((p: any) => `${p.type} ${p.name}`).join(',')})`
		const methodHash = Web3.utils.keccak256(Web3.utils.utf8ToHex(methodSig));
		// const methodHash = Web3.utils.keccak256(
		//     Web3.utils.utf8ToHex('WithdrawSigned(address token, address payee,uint256 amount,bytes32 salt)'));

		// ['bytes32', 'address', 'address', 'uint256', 'bytes32'];
		const params = ['bytes32'].concat(eipParams.args.map((p: any) => p.type));
		const structure = eth.abi.encodeParameters(params, [methodHash, ...eipParams.args.map((p: any) => p.value)]);
		const structureHash = Web3.utils.keccak256(structure);
		const ds = this.domainSeparator(eth, eipParams.contractName, eipParams.contractVersion, netId, contractAddress);
		const hash = Web3.utils.soliditySha3("\x19\x01", ds, structureHash);
		console.log('hash122222: ',hash);
		return { ...eipParams, hash, signature: '' };
	},

	domainSeparator(eth: any, contractName: string, contractVersion: string, netId: number, contractAddress: any) {
		const hashedName = Web3.utils.keccak256(Web3.utils.utf8ToHex(contractName));
		const hashedVersion = Web3.utils.keccak256(Web3.utils.utf8ToHex(contractVersion));
		const typeHash = Web3.utils.keccak256(
			Web3.utils.utf8ToHex("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
		console.log('Domain separator', "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)", typeHash)
		return Web3.utils.keccak256(
			eth.abi.encodeParameters(
				['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
				[typeHash, hashedName, hashedVersion, netId, contractAddress]
			)
		);
	},

	fixSig(sig: any) {
		const rs = sig.substring(0, sig.length - 2);
		let v = sig.substring(sig.length - 2);
		if (v === '00' || v ==='37' || v === '25') {
			v = '1b'
		} else if (v === '01' || v === '38' || v === '26') {
			v = '1c'
		}
		return rs+v;
	}
}
