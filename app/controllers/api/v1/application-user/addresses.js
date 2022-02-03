
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
var mongoose = require('mongoose');
const {
  recoverPersonalSignature
} = require('eth-sig-util');

module.exports = function (router) {

  router.get('/is/unique', async (req, res) => {

    let isUnique = true
    if (!req.query.address || !req.query.ferrumNetworkIdentifier) {
      return res.http400('address & ferrumNetworkIdentifier are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await getAddress(req, res, false)

    if (address && address.length> 0) {
      isUnique = false
    }
    return res.http200({
      isUnique: isUnique
    });

  });

  router.get('/is/unique/and/authenticated', async (req, res) => {

    let isUnique = true
    if (!req.query.address || !req.query.ferrumNetworkIdentifier) {
      return res.http400('address & ferrumNetworkIdentifier are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await getAddress(req, res, true)

    if (address && address.length> 0) {
      isUnique = false
    }
    return res.http200({
      isUnique: isUnique
    });

  });

  router.get('/is/authenticated', async (req, res) => {

    let isAuthenticated = false
    if (!req.query.address || !req.query.ferrumNetworkIdentifier || !req.query.userId) {
      return res.http400('address & ferrumNetworkIdentifier & userId are required.');
    }

    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier})

    if(!network){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorChangeFerrumNetworkIdentifier),stringHelper.strErrorChangeFerrumNetworkIdentifier,);
    }

    let address = await getAddress(req, res, true)

    if (address && address.length> 0) {
      isAuthenticated = true
    }
    return res.http200({
      isAuthenticated: isAuthenticated
    });

  });

  router.post('/create', async (req, res) => {

    let filter = {}

    if (!req.query.userId || !req.body.address || !req.body.ferrumNetworkIdentifier || !req.body.lastConnectedIpAddress) {
      return res.http400('userId & address & ferrumNetworkIdentifier and lastConnectedIpAddress are required.');
    }

    req.body.address = (req.body.address).toLowerCase()
    filter.user = req.query.userId

    let nonce = Math.floor(100000 + Math.random() * 900000)
    req.body.nonce = nonce
    req.body.user = req.query.userId
    req.body.createdAt = new Date()
    let network = await db.Networks.findOne({ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier})
    if(network){
      req.body.network = network._id
    }

    let address = await db.Addresses.create(req.body);

    if (address) {
      let addresses = []
      let userObject = await db.Users.findOne({_id: req.query.userId})
      if(userObject && userObject.addresses){
        addresses = userObject.addresses
      }
      addresses.push(address._id)
      await db.Users.findOneAndUpdate({_id: req.query.userId}, {addresses: addresses})
    }

    return res.http200({
      address: address
    });

  });

  router.put('/verify-signature', async (req, res) => {

    let filter = {}
    let addressObject = null

    if (!req.query.userId || !req.body.signature || !req.body.address || !req.body.ferrumNetworkIdentifier || !req.body.ipAddress) {
      return res.http400('userId & signature & address & ferrumNetworkIdentifier and ipAddress are required.');
    }
    filter.user = req.query.userId

    let address = await getAddress(req, res, false)
    console.log(address)
    if (address && address.length> 0) {
      addressObject = address[0]
    }

    if(addressObject && addressObject.network){
      // const bufferText = Buffer.from(`This signature verifies that you are the authorized owner of the wallet. The signature authentication is required to ensure allocations are awarded to the correct wallet owner.${addressObject.nonce}`, 'utf8');
      const bufferText = Buffer.from(`This signature verifies that you are the authorized owner of the wallet. The signature authentication is required to ensure allocations are awarded to the correct wallet owner.${addressObject.nonce}. id: ${addressObject.network.ferrumNetworkIdentifier}`, 'utf8');
      const data = `0x${bufferText.toString('hex')}`;
      try{
        const decryptedAddress = await recoverPersonalSignature({
          data: data,
          sig: req.body.signature
        });
        console.log(decryptedAddress)
        if(decryptedAddress && decryptedAddress.toLowerCase() == addressObject.address){
          let status = {isAddressAuthenticated: true, updatedAt: new Date()}
          let response = await db.Addresses.findOneAndUpdate({_id: addressObject._id}, {nonce: '', status: status})
          return res.http200({address: response});
        }
      }catch(err){
        return res.http400(err.message);
      }
    }
    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorSignatureVerificationFailed),stringHelper.strErrorSignatureVerificationFailed,);
  });

  async function getAddress(req, res, isFromUniqueAndAuthenticated = false){
    let sort = { createdAt: -1 }
    var matchFilter = {}
    var filterAndList= []
    var filter = []
    let ferrumNetworkIdentifier = ''
    let address = ''

    if(req.query.ferrumNetworkIdentifier){
      ferrumNetworkIdentifier = req.query.ferrumNetworkIdentifier
    }else {
      ferrumNetworkIdentifier = req.body.ferrumNetworkIdentifier
    }

    if(req.query.address){
      address = req.query.address
    }else {
      address = req.body.address
    }

    if(isFromUniqueAndAuthenticated){
      if(req.query.userId){
        filterAndList.push({ user: new mongoose.Types.ObjectId(req.query.userId) })
      }
      filterAndList.push({'status.isAddressAuthenticated': true })
    }

    filterAndList.push({address: (address).toLowerCase()})
    filterAndList.push({'network.ferrumNetworkIdentifier': ferrumNetworkIdentifier })

    if(filterAndList && filterAndList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterAndList})
    }

    filter = [
      { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
      { $unwind: { "path": "$network","preserveNullAndEmptyArrays": true}},
      { $match: matchFilter },
      { $sort: sort },
    ];

    let response = await db.Addresses.aggregate(filter);

    return response
  }

};
