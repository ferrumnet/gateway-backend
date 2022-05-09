
const { db, asyncMiddleware, commonFunctions, stringHelper, currencyHelper } = global
const mailer = global.mailer;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var path = require('path');
var ejs = require("ejs");

module.exports = function (router) {

  router.post('/create', async (req, res) => {

    if (!req.body.name || !req.body.symbol || !req.body.networks) {
      return res.http400('name & symbol & networks are required.');
    }

    if (req.body.networks && req.body.networks.length == 0) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork),stringHelper.strErrorCurrencyShouldAssociateWithAtleastOneNetwork,);
    }

    let error = await commonFunctions.validationForUniqueCBN(req, res)
    if (error) {
      return res.http400(error);
    }

    req.body.createdByUser = req.user._id
    req.body.createdByOrganization = req.user.organization

    req.body.nameInLower = (req.body.name).toLowerCase()
    req.body.createdAt = new Date()


    let currency = await db.Currencies.create(req.body)
    currency.currencyAddressesByNetwork = await currencyHelper.createCurrencyAddresses(req, currency, req.body)
    currency = await db.Currencies.findOneAndUpdate({ _id: currency }, currency, { new: true });

    return res.http200({
      currency: currency
    });

  });

  router.get('/list', async (req, res) => {
    var matchFilter = {}
    var filterOrList= []
    var filterAndList= []
    var filter = []
    let currencies = []
    var sort = { "createdAt": -1 }

    filterAndList.push({ createdByUser: new mongoose.Types.ObjectId(req.user._id) })

    if(req.query.search){
      let reg = new RegExp(unescape(req.query.search), 'i');
      filterOrList.push({"nameInLower": reg})
      filterOrList.push({"symbol": reg})
      filterOrList.push({"currencyAddressesByNetwork": {$elemMatch: {'tokenContractAddress':reg} } })
    }

    if(filterOrList && filterOrList.length > 0){
      matchFilter.$or = []
      matchFilter.$or.push({$or: filterOrList})
    }

    if(filterAndList && filterAndList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterAndList})
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

  router.get('/:id', async (req, res) => {

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

  router.get('/check/tokenContractAddress/is/unique', async (req, res) => {

    var filter = {}
    let count = 0

    if (!req.query.tokenContractAddress) {
      return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorContractTokenAddressIsRequired),stringHelper.strErrorContractTokenAddressIsRequired,);
    }

    filter.tokenContractAddress = (req.query.tokenContractAddress).toLowerCase()
    count = await db.CurrencyAddressesByNetwork.count(filter)
    if (count == 0) {
      return res.http200({
        message: await commonFunctions.getValueFromStringsPhrase(stringHelper.strSuccessContractTokenAddressIsunique),
        phraseKey: stringHelper.strSuccessContractTokenAddressIsunique,
      });
    }

    return res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorUniqueContractTokenAddress),stringHelper.strErrorUniqueContractTokenAddress,);

  });

};
