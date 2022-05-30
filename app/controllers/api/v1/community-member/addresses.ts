
const {
  recoverPersonalSignature
} = require('eth-sig-util');

module.exports = function (router: any) {

  router.get('/generate/nonce', async (req: any, res: any) => {

    let address: any = {}

    address = await db.Addresses.findOne({ user: req.user._id }).sort({ createdAt: -1 }).populate('network')
    if (address) {
      req.body.address = address.address
      req.body.ferrumNetworkIdentifier = address.network.ferrumNetworkIdentifier
    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorWrongAddressOrFerrumNetworkIdentifier), stringHelper.strErrorWrongAddressOrFerrumNetworkIdentifier,);
    }

    let network = await db.Networks.findOne({ ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier })

    if (!network) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier), stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let resAddress = await addressesHelper.genrateNonceByABN(req, res, address, network)

    return res.http200({
      nonce: resAddress.nonce
    });

  });

  router.post('/verify-signature', async (req: any, res: any) => {

    let addressObject = null
    const signature = req.body.signature
    const token = req.headers.authorization.substring(7)
    if (!signature) {
      return res.http400('signature is required.');
    }

    addressObject = await db.Addresses.findOne({ user: req.user._id }).sort({ createdAt: -1 }).populate('network')
    if (addressObject) {
      req.body.address = addressObject.address
      req.body.ferrumNetworkIdentifier = addressObject.network.ferrumNetworkIdentifier
    } else {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorWrongAddressOrFerrumNetworkIdentifier), stringHelper.strErrorWrongAddressOrFerrumNetworkIdentifier,);
    }

    if (addressObject && addressObject.network) {
      const bufferText = Buffer.from(`${(global as any).environment.verifySignaturePrefixBufferText}${addressObject.nonce}. id: ${addressObject.network.ferrumNetworkIdentifier}`, 'utf8');
      const data = `0x${bufferText.toString('hex')}`;
      try {
        const decryptedAddress = await recoverPersonalSignature({
          data: data,
          sig: signature
        });      
        // console.log(decryptedAddress)
        if (decryptedAddress && decryptedAddress.toLowerCase() == addressObject.address) {
          await db.Addresses.findOneAndUpdate({_id: addressObject._id}, {nonce: ''}, { new: true })
          const profileToken = req.user.createProfileUpdateToken(token, signature);
          return res.http200({ token: profileToken });
        }
      } catch (err: any) {
        return res.http400(err.message);
      }
    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSignatureVerificationFailed), stringHelper.strErrorSignatureVerificationFailed,);
  });

};
