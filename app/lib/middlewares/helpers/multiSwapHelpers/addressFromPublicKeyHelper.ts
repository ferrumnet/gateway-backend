

module.exports = {

	async forNetwork(network: any, publicKeyCompressed: any, publicKeyUncompressed: any) {

		if (network == 'ETHEREUM') {
			let frmAddr = swapUtilsHelper.ethAddressFromPublicKey(publicKeyUncompressed).replace('0x', 'fx');
			console.log('frmAddr',frmAddr.toLowerCase())
			return {
				address: frmAddr.toLowerCase(),
				addressWithChecksum: frmAddr,
			};
		}
	}

}
