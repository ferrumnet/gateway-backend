
const { db, asyncMiddleware, commonFunctions } = global
const mailer = global.mailer;
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/list', async (req, res) => {
    var matchFilter = {}
    var matchInnerFilter = {}
    var filterList= []
    var filterInnerList= []
    var filter = []
    let dexes = []
    var sort = { "createdAt": -1 }


    if(req.query.network){
      filterList.push({"network": new mongoose.Types.ObjectId(req.query.network)})
    }


    if(req.query.isActive){
      if(req.query.isActive == 'true'){
        filterInnerList.push({"dex.isActive": true})
      }else {
        filterInnerList.push({"dex.isActive": false})
      }
    }

    if(filterList && filterList.length > 0){
      matchFilter.$and = []
      matchFilter.$and.push({$and: filterList})
    }

    if(filterInnerList && filterInnerList.length > 0){
      matchInnerFilter.$and = []
      matchInnerFilter.$and.push({$and: filterInnerList})
    }

    if(req.query.isPagination != null && req.query.isPagination == 'false'){

      filter = [
        { "$match": matchFilter },
        { $lookup: { from: 'decentralizedExchanges', localField: 'dex', foreignField: '_id', as: 'dex' } },
        { "$unwind": { "path": "$dex","preserveNullAndEmptyArrays": true}},
        { "$match": matchInnerFilter },
        { "$sort": sort }
      ];

    }else {

      filter = [
        { "$match": matchFilter },
        { $lookup: { from: 'decentralizedExchanges', localField: 'dex', foreignField: '_id', as: 'dex' } },
        { "$unwind": { "path": "$dex","preserveNullAndEmptyArrays": true}},
        { "$match": matchInnerFilter },
        { "$sort": sort },
        { $skip: req.query.offset ? parseInt(req.query.offset) : 0 },
        { $limit: req.query.limit ? parseInt(req.query.limit) : 10 },
      ];

    }

    dexes = await db.NetworkDexes.aggregate(filter);

    return res.http200({
      networkDexes: dexes
    });

  });

};
