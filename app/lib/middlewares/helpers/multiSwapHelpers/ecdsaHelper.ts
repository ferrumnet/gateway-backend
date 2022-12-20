var ec = require('elliptic').ec;
var encHex = require('crypto-js/enc-hex');
var cryptoJS = require('crypto-js');

module.exports = {

	curve() {
		return new ec('secp256k1');
	},

	async sign(sk: any, msgHash: any) {
		const msg = swapUtilsHelper.hexToArrayBuffer(msgHash) as any;
		const key = this.curve().keyFromPrivate(swapUtilsHelper.hexToArrayBuffer(sk) as any);
		const signature = key.sign(msg);
		let isValid = key.verify(msgHash, signature);
		if (isValid) {
			return { code: 200, data: this.encode(swapUtilsHelper.arrayBufferToHex(signature.r.toBuffer('be', 32)), swapUtilsHelper.arrayBufferToHex(signature.s.toBuffer('be', 32)), signature.recoveryParam || 0) };
		}
		return { code: 400, data: null };
	},

	async recoverAddress(sig: any, msgHash: any) {
        const curve = this.curve(); 
        const [r, s, v] = this.decode(sig);
        const sigDecoded = { r, s, recoveryParam: v } as any;
        const pub = curve.recoverPubKey(swapUtilsHelper.hexToArrayBuffer(msgHash), sigDecoded, v);
        const pubKey = curve.keyPair({pub});
        const pubHex = pubKey.getPublic().encode('hex', false);
		console.log('pubKey',pubKey);
		console.log('pubHex',pubHex);
        return await addressFromPublicKeyHelper.forNetwork(
            'ETHEREUM', 
            pubHex.substring(0, 66), // Dummy compressed pubkey. Not needed for ETH network
            pubHex).address;
    },
	
	encode(r: any, s: any, v: any) {
		console.log('r:::', r);
		console.log('s:::', s);
		console.log('v:::', v);

		if (r.length != 64) {
			console.log('r len is not 64')
		}

		if (s.length != 64) {
			console.log('s len is not 64')
		}
		// ValidationUtils.isTrue(r.length === 64, 'r len is not 64');
		// ValidationUtils.isTrue(s.length === 64, 's len is not 64');
		let h = v.toString(16);

		if (h.length > 2) {
			console.log('v too large')
		}
		// ValidationUtils.isTrue(h.length <= 2, 'v too large');
		if (h.length === 1) { h = '0' + h; }
		// return r+s+h;
		return r + s;
	},

	decode(sig: any): [string, string, number] {
		// error
        // ValidationUtils.isTrue(sig.length === 64 * 2 + 2, 'sig len rs not 66');
        return [sig.substring(0, 64), sig.substring(64, 64 * 2), Number('0x' + sig.substring(64 * 2))];
    }

}
