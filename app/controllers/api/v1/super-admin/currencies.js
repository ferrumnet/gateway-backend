
const { db, asyncMiddleware, commonFunctions, stringHelper } = global

module.exports = function (router) {

  router.get('/list', async (req, res) => {
    var matchFilter = {}
    var filterOrList= []
    var filterAndList= []
    var filter = []
    let currencies = []
    var sort = { "createdAt": -1 }


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

};
