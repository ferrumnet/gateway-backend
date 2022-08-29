var ec = require('elliptic').ec;
var encHex = require('crypto-js/enc-hex');
var cryptoJS = require('crypto-js');

module.exports = {

	curve() {
		return new ec('secp256k1');
	},

	async sign(sk: any, msgHash: any) {
		const msg = this.hexToArrayBuffer(msgHash) as any;
		const key = this.curve().keyFromPrivate(this.hexToArrayBuffer(sk) as any);
		const signature = key.sign(msg);
		let isValid = key.verify(msgHash, signature);
		if (isValid) {
			return { code: 200, data: this.encode(this.arrayBufferToHex(signature.r.toBuffer('be', 32)), this.arrayBufferToHex(signature.s.toBuffer('be', 32)), signature.recoveryParam || 0) };
		}
		return { code: 400, data: null };
	},

	hexToArrayBuffer(hex: any): Uint8Array {
		// @ts-ignore
		hex = hex.toString(16);
	  
		hex = hex.replace(/^0x/i,'');
	  
		let bytes: any[] = [];
		for (let c = 0; c < hex.length; c += 2)
		  bytes.push(parseInt(hex.substr(c, 2), 16));
		// @ts-ignore
		return new Uint8Array(bytes);
	  },

	encode(r: any, s: any, v: any) {
		console.log('r:::',r);
		console.log('s:::',s);
		console.log('v:::',v);

		if(r.length != 64){
			console.log('r len is not 64')
		}

		if(s.length != 64){
			console.log('s len is not 64')
		}
        // ValidationUtils.isTrue(r.length === 64, 'r len is not 64');
        // ValidationUtils.isTrue(s.length === 64, 's len is not 64');
        let h = v.toString(16);

		if(h.length > 2){
			console.log('v too large')
		}
        // ValidationUtils.isTrue(h.length <= 2, 'v too large');
        if (h.length === 1) { h = '0' + h; }
        // return r+s+h;
		return r+s;
    },

	arrayBufferToHex(ab: any) {
		return encHex.stringify(cryptoJS.lib.WordArray.create(ab));
	}

}
