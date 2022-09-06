var encHex = require('crypto-js/enc-hex');
var cryptoJS = require('crypto-js');
var encHex = require('crypto-js/enc-hex');
var SHA3 = require('crypto-js/sha3');
var encUtf8 = require('crypto-js/enc-utf8');
var { Big } = require("big.js");

module.exports = {

	ethAddressFromPublicKey(publicKey: any) {
		const publicHash = this.sha3(publicKey.slice(2));
		return this.toChecksum("0x" + publicHash.slice(-40));
	},

	sha3(hexData: string) {
		const dataWa = encHex.parse(hexData);
		const hash: any = SHA3(dataWa, { outputLength: 256 });
		return hash.toString(encHex);
	},

	toChecksum(address: any) {
		const addressHash = '0x' + this.sha3(this.utf8ToHex(address.slice(2)));
		let checksumAddress = "0x";
		for (let i = 0; i < 40; i++)
			checksumAddress += parseInt(addressHash[i + 2], 16) > 7
				? address[i + 2].toUpperCase()
				: address[i + 2];
		return checksumAddress;
	},

	utf8ToHex(hexStr: any) {
		return encHex.stringify(encUtf8.parse(hexStr));
	},

	hexToArrayBuffer(hex: any): Uint8Array {
		hex = hex.toString(16);
		hex = hex.replace(/^0x/i, '');
		let bytes: any[] = [];
		for (let c = 0; c < hex.length; c += 2)
			bytes.push(parseInt(hex.substr(c, 2), 16));
		return new Uint8Array(bytes);
	},

	arrayBufferToHex(ab: any) {
		return encHex.stringify(cryptoJS.lib.WordArray.create(ab));
	},

	trim0x(s: string) {
		if (s.startsWith('0x') || s.startsWith('0X')) {
			return s.substring(2);
		}
		return s;
	},

	unFixSig(sig: any) {
		const rs = sig.substring(0, sig.length - 2);
		let v = sig.substring(sig.length - 2);
		if (v === '1b') {
			v = '00'
		} else if (v === '1c') {
			v = '01'
		}
		return rs + v;
	},

	add0x(s: any): string {
		if (s.startsWith('0x') || s.startsWith('0X')) {
			return s;
		}
		return '0x' + s;
	},

	async amountToHuman(amount: string, decimal: number) {
		const decimalFactor = 10 ** decimal;
		return new Big(amount).div(decimalFactor).toFixed();
	},

	async amountToMachine(network: any, cabn: any, amount: number) {
		let decimal = await this.decimals(network, cabn);
		let decimalFactor = 10 ** decimal;
		return new Big(amount).times(decimalFactor).toFixed(0);
	},

	async amountToHuman_(network: any, cabn: any, amount: number) {
		let decimal = await this.decimals(network, cabn);
		if (decimal) {
			let decimalFactor = 10 ** decimal;
			return new Big(amount).div(decimalFactor).toFixed();
		}

		return null;
	},

	async decimals(network: any, cabn: any) {

		if (network.rpcUrl && cabn.tokenContractAddress) {

			let con = web3ConfigurationHelper.erc20(network.rpcUrl, cabn.tokenContractAddress)
			if (con) {
				return await con.methods.decimals().call();
			}

		}

		return null;
	},

	async estimateGasOrDefault(method: any, from: string, defaultGas?: number) {
		// try {
		  return await method.estimateGas({ from });
		// } catch (e) {
		//   console.log(e);
		//   console.info('Error estimating gas. Tx might be reverting..');
		//   return defaultGas;
		// }
	  },
}
