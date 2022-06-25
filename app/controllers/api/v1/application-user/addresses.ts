
var mongoose = require('mongoose');
var {
  recoverPersonalSignature
} = require('eth-sig-util');

module.exports = function (router: any) {

  router.get('/is/unique', async (req: any, res: any) => {

    let isUnique = true
    if (!req.query.address || !req.query.ferrumNetworkIdentifier) {
      return res.http400('address & ferrumNetworkIdentifier are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await addressesHelper.getAddress(req, res, false)

    if (address && address.length> 0) {
      isUnique = false
    }
    return res.http200({
      isUnique: isUnique
    });

  });

  router.get('/is/unique/and/authenticated', async (req: any, res: any) => {

    let isUnique = true
    if (!req.query.address || !req.query.ferrumNetworkIdentifier) {
      return res.http400('address & ferrumNetworkIdentifier are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await addressesHelper.getAddress(req, res, true)

    if (address && address.length> 0) {
      isUnique = false
    }
    return res.http200({
      isUnique: isUnique
    });

  });

  router.get('/is/authenticated', async (req: any, res: any) => {

    let isAuthenticated = false
    if (!req.query.address || !req.query.ferrumNetworkIdentifier || !req.query.userId) {
      return res.http400('address & ferrumNetworkIdentifier & userId are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await addressesHelper.getAddress(req, res, true)

    if (address && address.length> 0) {
      isAuthenticated = true
    }
    return res.http200({
      isAuthenticated: isAuthenticated
    });

  });

  router.post('/generate/nonce', async (req: any, res: any) => {

    let address = {}

    if (!req.body.address || !req.body.ferrumNetworkIdentifier) {
      return res.http400('address & ferrumNetworkIdentifier are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let addresses = await addressesHelper.getAddress(req, res, false)

    if (addresses && addresses.length> 0) {
      address = addresses[0]
    }

    let resAddress = await addressesHelper.genrateNonceByABN(req, res, address, network)

    return res.http200({
      nonce: resAddress.nonce
    });

  });

  router.post('/verify-signature', async (req: any, res: any) => {

    let addressObject = null

    if (!req.body.signature || !req.body.address || !req.body.ferrumNetworkIdentifier || !req.body.role) {
      return res.http400('signature & address & ferrumNetworkIdentifier and role are required.');
    }

    let address = await addressesHelper.getAddress(req, res, false)
    if (address && address.length> 0) {
      addressObject = address[0]
    }

    if(addressObject && addressObject.network){
      const bufferText = Buffer.from(`${(global as any).environment.verifySignaturePrefixBufferText}${addressObject.nonce}. id: ${addressObject.network.ferrumNetworkIdentifier}`, 'utf8');
      const data = `0x${bufferText.toString('hex')}`;
      try{
        const decryptedAddress = await recoverPersonalSignature({
          data: data,
          sig: req.body.signature
        });
        console.log(decryptedAddress)
        if(decryptedAddress && decryptedAddress.toLowerCase() == addressObject.address){
          return res.http200(await addressesHelper.createUserByABN(req, res, addressObject));
        }
      }catch(err: any){
        return res.http400(err.message);
      }
    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSignatureVerificationFailed),stringHelper.strErrorSignatureVerificationFailed,);
  });

};
