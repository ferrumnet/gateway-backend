
const { db, asyncMiddleware, commonFunctions, stringHelper } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/cabn/list', async (req, res) => {
    var matchFilter = {}
    var filterOrList= []
    var filterAndList= []
    var filter = []
    let cabns = []
    var sort = { "createdAt": -1 }

    if(req.query.search){
      let reg = new RegExp(unescape(req.query.search), 'i');
      filterOrList.push({"currency.nameInLower": reg})
      filterOrList.push({"currency.symbol": reg})
      filterOrList.push({"tokenContractAddress": reg })
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
        { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
        { "$unwind": { "path": "$network","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'networkDexes', localField: 'networkDex', foreignField: '_id', as: 'networkDex' } },
        { "$unwind": { "path": "$networkDex","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'currencies', localField: 'currency', foreignField: '_id', as: 'currency' } },
        { "$unwind": { "path": "$currency","preserveNullAndEmptyArrays": true}},
        { "$match": matchFilter },
        { "$sort": sort }
      ];

    } else {

      filter = [
        { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
        { "$unwind": { "path": "$network","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'networkDexes', localField: 'networkDex', foreignField: '_id', as: 'networkDex' } },
        { "$unwind": { "path": "$networkDex","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'currencies', localField: 'currency', foreignField: '_id', as: 'currency' } },
        { "$unwind": { "path": "$currency","preserveNullAndEmptyArrays": true}},
        { "$match": matchFilter },
        { "$sort": sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];

    }

    cabns = await db.CurrencyAddressesByNetwork.aggregate(filter);

    return res.http200({
      currencyAddressesByNetworks: cabns
    });
  });

};
