var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/cabn/list', async (req: any, res: any) => {
    var matchFilter: any = {}
    var filterOrList= []
    var filterAndList: any= []
    var filter = []
    let cabns = []
    var sort = { "createdAt": -1 }

    if(req.query.search){
      let reg = new RegExp(unescape(req.query.search), 'i');
      filterOrList.push({"currency.nameInLower": reg})
      filterOrList.push({"currency.symbol": reg})
      filterOrList.push({"tokenContractAddress": reg })
    }

    if (req.query.isAllowedOnMultiSwap) {

      if (req.query.isAllowedOnMultiSwap == 'true') {
        filterAndList.push({"isAllowedOnMultiSwap": true})
      } else {
        filterAndList.push({"isAllowedOnMultiSwap": false})
      }

    }

    if (req.query.network) {
      filterAndList.push({"network._id": new mongoose.Types.ObjectId(req.query.network)})
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

  router.get('/cabn/for/fee/token/list', async (req: any, res: any) => {
    var matchFilter: any = {}
    var filterOrList: any= []
    var filterAndList: any= []
    var filter = []
    let cabns = []
    var sort: any = { "createdAt": -1 }

    if (req.query.sortKey) {
      Object.keys(sort).forEach(key => {
        delete sort[key];
      })
      sort = { [req.query.sortKey] : parseInt(req.query.sortOrder)}
    }

    if (req.query.isFeeToken) {

      if (req.query.isFeeToken == 'true') {
        filterAndList.push({"isFeeToken": true})
      } else {
        filterAndList.push({"isFeeToken": false})
      }

    }

    if (req.query.isBaseFeeToken) {

      if (req.query.isBaseFeeToken == 'true') {
        filterAndList.push({"isBaseFeeToken": true})
      } else {
        filterAndList.push({"isBaseFeeToken": false})
      }

    }

    if (req.query.networkId) {
      filterAndList.push({"network._id": new mongoose.Types.ObjectId(req.query.networkId)})
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
