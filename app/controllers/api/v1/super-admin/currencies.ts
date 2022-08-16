import { isValidObjectId } from "mongoose";

module.exports = function (router: any) {

  router.post('/create', async (req: any, res: any) => {

    if (!req.body.name || !req.body.symbol || !req.body.networks || !req.body.organization) {
      return res.http400('name & symbol & networks & organization are required.');
    }

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork), stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork,);
    }

    let error = await commonFunctions.validationForUniqueCBN(req, res)
    if (error) {
      return res.http400(error);
    }

    req.body.createdByUser = req.user._id
    req.body.updatedByUser = req.user._id
    req.body.createdByOrganization = req.body.organization

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()
    req.body.updatedAt = new Date()

    let currency = await db.Currencies.create(req.body)
    currency.currencyAddressesByNetwork = await currencyHelper.createCurrencyAddresses(req, currency, req.body)
    currency = await db.Currencies.findOneAndUpdate({ _id: currency }, currency, { new: true });

    return res.http200({
      currency: currency
    });

  });

  router.post('/update/:id', async (req: any, res: any) => {

    if (!req.body.name || !req.body.symbol || !req.body.organization) {
      return res.http400('name & symbol & organization are required.');
    }

    if (req.body.networks) {
      delete req.body.networks
    }

    req.body.updatedByUser = req.user._id
    req.body.createdByOrganization = req.body.organization

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.updatedAt = new Date()
    console.log(req.body)

    let currency = await db.Currencies.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });

    return res.http200({
      currency: currency
    });

  });

  router.get('/list', async (req: any, res: any) => {
    var matchFilter: any = {}
    var filterOrList = []
    var filterAndList: any = []
    var filter = []
    let currencies = []
    var sort = { "createdAt": -1 }


    if (req.query.search) {
      let reg = new RegExp(unescape(req.query.search), 'i');
      filterOrList.push({ "nameInLower": reg })
      filterOrList.push({ "symbol": reg })
      filterOrList.push({ "currencyAddressesByNetwork": { $elemMatch: { 'tokenContractAddress': reg } } })
    }

    if (filterOrList && filterOrList.length > 0) {
      matchFilter.$or = []
      matchFilter.$or.push({ $or: filterOrList })
    }

    if (filterAndList && filterAndList.length > 0) {
      matchFilter.$and = []
      matchFilter.$and.push({ $and: filterAndList })
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      filter = [
        { $lookup: { from: 'currencyAddressesByNetwork', localField: 'currencyAddressesByNetwork', foreignField: '_id', as: 'currencyAddressesByNetwork' } },
        { "$match": matchFilter },
        { "$sort": sort }
      ];

    } else {

      filter = [
        { $lookup: { from: 'currencyAddressesByNetwork', localField: 'currencyAddressesByNetwork', foreignField: '_id', as: 'currencyAddressesByNetwork' } },
        { "$match": matchFilter },
        { "$sort": sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];

    }

    currencies = await db.Currencies.aggregate(filter);

    return res.http200({
      currencies: currencies
    });
  });

  router.get('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let currencyAddressesByNetwork = []
    let currency = await db.Currencies.findOne(filter)
      .populate({
        path: 'currencyAddressesByNetwork',
        populate: {
          path: 'network',
          model: 'networks'
        }
      })
      .populate({
        path: 'currencyAddressesByNetwork',
        populate: {
          path: 'networkDex',
          populate: {
            path: 'dex',
            model: 'decentralizedExchanges'
          }
        }
      })

    return res.http200({
      currency: currency
    });

  });

  router.delete('/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    if (await currencyHelper.currencyAssociationWithNetwork(req, res) > 0
      && await currencyHelper.currencyAssociationWithLeaderboard(req, res) > 0
      && await currencyHelper.currencyAssociationWithTokenHoldersBalanceSnapshots(req, res) > 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorDelete), stringHelper.strErrorDelete,);
    }

    let response = await db.Currencies.remove(filter)

    return res.http200({
      currency: response
    });

  });

  router.post('/create/cabn', async (req: any, res: any) => {

    if (!req.body.network || !req.body.currency) {
      return res.http400('network & currency are required.');
    }

    req.body.networks = [];
    req.body.networks.push(req.body.network)

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork), stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork,);
    }

    let error = await commonFunctions.validationForUniqueCBN(req, res)
    if (error) {
      return res.http400(error);
    }

    req.body.createdByUser = req.user._id
    req.body.createdByOrganization = req.user.organization

    req.body.createdAt = new Date()


    let currency = await db.Currencies.findOne({ _id: req.body.currency })
    if (currency) {
      currency.currencyAddressesByNetwork.push(await currencyHelper.createCurrencyAddresses(req, currency, req.body))
      console.log(currency)
      currency = await db.Currencies.findOneAndUpdate({ _id: currency }, { currencyAddressesByNetwork: currency.currencyAddressesByNetwork }, { new: true });
    }

    return res.http200({
      currency: currency
    });

  });

  router.get('/cabn/:id', async (req: any, res: any) => {

    let filter = {}
    filter = { _id: req.params.id }

    let cabn = await db.CurrencyAddressesByNetwork.findOne(filter)
      .populate('network')
      .populate('currency')
      .populate({
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      })

    return res.http200({
      cabn: cabn
    });

  });

  router.put('/cabn/allow/on/multi/swap/:id', async (req: any, res: any) => {

    let filter = { _id: req.params.id }
    let isAllowedOnMultiSwap = req.body.isAllowedOnMultiSwap

    if (!isValidObjectId(filter._id) || typeof isAllowedOnMultiSwap != 'boolean') {
      return res.http400('Valid cabnId & isAllowedOnMultiSwap are required.');
    }
    let cabn = await db.CurrencyAddressesByNetwork.findOneAndUpdate(filter, { isAllowedOnMultiSwap }, { new: true })

    return res.http200({
      cabn: cabn
    });

  });

};
