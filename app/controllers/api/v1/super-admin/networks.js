
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.ferrumNetworkIdentifier || !req.body.networkShortName || !req.body.chainId || req.body.isTestnet == null) {
      return res.http400('name & ferrumNetworkIdentifier & networkShortName & chainId & isTestnet are required.');
    }

    if (req.body.isTestnet == true && !req.body.parentId) {
      return res.http400('parentId is required.');
    }

    if(req.body.isTestnet == false){
      req.body.parentId = null
    }

    let ferrumNetworkIdentifierCount = await db.Networks.count({ ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier });

    if (ferrumNetworkIdentifierCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists),stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists,);
    }

    req.body.user = req.user._id
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let network = await db.Networks.create(req.body)

    return res.http200({
      network: network
    });

  });

  router.put('/update/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.ferrumNetworkIdentifier || !req.body.networkShortName || !req.body.chainId || req.body.isTestnet == null) {
      return res.http400('name & ferrumNetworkIdentifier & networkShortName & chainId & isTestnet are required.');
    }

    if (req.body.isTestnet == true && !req.body.parentId) {
      return res.http400('parentId is required.');
    }

    if(req.body.isTestnet == false){
      req.body.parentId = null
    }

    let ferrumNetworkIdentifierCount = await db.Networks.count({ ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier, _id: { $ne: req.params.id }  });

    if (ferrumNetworkIdentifierCount > 0) {
      return res.http400(stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists);
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let network = await db.Networks.findOneAndUpdate(filter, req.body, { new: true }).populate('parentId')

    return res.http200({
      network: network
    });

  });

  router.put('/active/inactive/:id', async (req, res) => {

    let filter = {}
    filter = { _id: req.params.id }

    let network = await db.Networks.findOne(filter)
    if(network){
      network.isActive = !network.isActive
    }
    req.body.updatedAt = new Date()

    network = await db.Networks.findOneAndUpdate(filter, network, { new: true }).populate('parentId')

    return res.http200({
      network: network
    });

  });

  router.get('/list', async (req, res) => {

    var filter = {}

    let netwroks = await db.Networks.find(filter).populate('parentId')
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      netwroks: netwroks
    });

  });

  router.get('/:id', async (req, res) => {
    let filter = {}
    filter = { _id: req.params.id }

    let network = await db.Networks.findOne(filter).populate('parentId')

    return res.http200({
      network: network
    });

  });

};
