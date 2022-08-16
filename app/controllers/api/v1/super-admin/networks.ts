import { isValidObjectId } from "mongoose";
module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.ferrumNetworkIdentifier || !req.body.networkShortName || !req.body.chainId || req.body.isTestnet == null) {
      return res.http400('name & ferrumNetworkIdentifier & networkShortName & chainId & isTestnet are required.');
    }

    if (req.body.isTestnet == true && !req.body.parentId) {
      return res.http400('parentId is required.');
    }

    if (req.body.isTestnet == false) {
      req.body.parentId = null
    }

    if (!req.body.networkCurrencyAddressByNetwork) {
      req.body.networkCurrencyAddressByNetwork = null
    }

    let ferrumNetworkIdentifierCount = await db.Networks.count({ ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier });

    if (ferrumNetworkIdentifierCount > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists), stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists,);
    }

    req.body.user = req.user._id
    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()

    let network = await db.Networks.create(req.body)

    return res.http200({
      network: network
    });

  });

  router.put('/update/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (!req.body.name || !req.body.ferrumNetworkIdentifier || !req.body.networkShortName || !req.body.chainId || req.body.isTestnet == null) {
      return res.http400('name & ferrumNetworkIdentifier & networkShortName & chainId & isTestnet are required.');
    }

    if (req.body.isTestnet == true && !req.body.parentId) {
      return res.http400('parentId is required.');
    }

    if (req.body.isTestnet == false) {
      req.body.parentId = null
    }

    if (!req.body.networkCurrencyAddressByNetwork) {
      req.body.networkCurrencyAddressByNetwork = null
    }

    let ferrumNetworkIdentifierCount = await db.Networks.count({ ferrumNetworkIdentifier: req.body.ferrumNetworkIdentifier, _id: { $ne: req.params.id } });

    if (ferrumNetworkIdentifierCount > 0) {
      return res.http400(stringHelper.strErrorFerrumNetworkIdentifierAlreadyExists);
    }

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()

    let network = await db.Networks.findOneAndUpdate(filter, req.body, { new: true }).populate('parentId').populate('networkCurrencyAddressByNetwork')

    return res.http200({
      network: network
    });

  });

  router.put('/active/inactive/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let network = await db.Networks.findOne(filter)
    if (network) {
      network.isActive = !network.isActive
    }
    req.body.updatedAt = new Date()

    network = await db.Networks.findOneAndUpdate(filter, network, { new: true }).populate('parentId').populate('networkCurrencyAddressByNetwork')

    return res.http200({
      network: network
    });

  });

  router.get('/list', async (req: any, res: any) => {

    var filter = {}

    let netwroks = await db.Networks.find(filter).populate('parentId')
      .populate({
        path: 'networkCurrencyAddressByNetwork',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .populate({
        path: 'networkCurrencyAddressByNetwork',
        populate: {
          path: 'networkDex',
          populate: {
            path: 'dex',
            model: 'decentralizedExchanges'
          }
        }
      })
      .sort({ createdAt: -1 })
      .skip(req.query.offset ? parseInt(req.query.offset) : 0)
      .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    return res.http200({
      netwroks: netwroks
    });

  });

  router.get('/:id', async (req: any, res: any) => {
    let filter = {}
    filter = { _id: req.params.id }

    let network = await db.Networks.findOne(filter).populate('parentId')
      .populate({
        path: 'networkCurrencyAddressByNetwork',
        populate: {
          path: 'currency',
          model: 'currencies'
        }
      })
      .populate({
        path: 'networkCurrencyAddressByNetwork',
        populate: {
          path: 'networkDex',
          populate: {
            path: 'dex',
            model: 'decentralizedExchanges'
          }
        }
      })

    return res.http200({
      network: network
    });

  });

  router.put('/allow/on/gateway/:id', async (req: any, res: any) => {

    let filter = { _id: req.params.id }
    let isAllowedOnGateway = req.body.isAllowedOnGateway

    if (!isValidObjectId(filter._id) || typeof isAllowedOnGateway != 'boolean') {
      return res.http400('Valid networkId & isAllowedOnGateway are required.');
    }
    let network = await db.Networks.findOneAndUpdate(filter, { isAllowedOnGateway }, { new: true })
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound), stringHelper.strErrorNetwrokNotFound);

  });

  router.put('/allow/on/multi/swap/:id', async (req: any, res: any) => {

    let filter = { _id: req.params.id }
    let isAllowedOnMultiSwap = req.body.isAllowedOnMultiSwap

    if (!isValidObjectId(filter._id) || typeof isAllowedOnMultiSwap != 'boolean') {
      return res.http400('Valid networkId & isAllowedOnMultiSwap are required.');
    }
    let network = await db.Networks.findOneAndUpdate(filter, { isAllowedOnMultiSwap }, { new: true })
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound), stringHelper.strErrorNetwrokNotFound);

  });

  router.delete('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if(await networksHelper.cabnAssociationWithNetwork(req, res) > 0 || await networksHelper.dexAssociationWithNetwork(req, res) > 0){
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetworkDelete),stringHelper.strErrorNetworkDelete,);
    }

    let response = await db.Networks.remove(filter)

    return res.http200({
      network: response
    });

  });


};
