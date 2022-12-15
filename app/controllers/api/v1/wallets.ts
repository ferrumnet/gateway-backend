var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/wbn/list', async (req: any, res: any) => {
    var matchFilter: any = {}
    var filterOrList: any= []
    var filterAndList: any= []
    var filter: any = []
    var innerFilter: any = []
    let wbns = []
    var sort: any = { "createdAt": -1 }

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

    if (req.query.sortKey) {
      Object.keys(sort).forEach(key => {
        delete sort[key];
      })
      sort = { [req.query.sortKey] : parseInt(req.query.sortOrder)}
    }

    if (!req.query.networkId) {
      innerFilter = [
        { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
        { "$unwind": { "path": "$network","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'wallets', localField: 'wallet', foreignField: '_id', as: 'wallet' } },
        { "$unwind": { "path": "$wallet","preserveNullAndEmptyArrays": true}},
        { "$group": { _id: { wallet: "$wallet" } } },
        { "$project": { _id: 0, wallet: "$_id.wallet"} },
        { "$match": matchFilter },
        { "$sort": sort }
      ];
    }else {
      innerFilter = [
        { $lookup: { from: 'networks', localField: 'network', foreignField: '_id', as: 'network' } },
        { "$unwind": { "path": "$network","preserveNullAndEmptyArrays": true}},
        { $lookup: { from: 'wallets', localField: 'wallet', foreignField: '_id', as: 'wallet' } },
        { "$unwind": { "path": "$wallet","preserveNullAndEmptyArrays": true}},
        { "$match": matchFilter },
        { "$sort": sort }
      ];
    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      filter = [
        ...innerFilter
      ];

    } else {

      filter = [
        ...innerFilter,
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];

    }
    
    wbns = await db.WalletByNetwork.aggregate(filter);

    return res.http200({
      walletByNetworks: wbns
    });
  });

};
