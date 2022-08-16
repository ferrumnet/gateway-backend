module.exports = function (router: any) {

  // This end point needs to be retired
  router.get('/', async (req: any, res: any) => {

    var filter = { ferrumNetworkIdentifier: req.query.ferrumNetworkIdentifier }
    let network = await db.Networks.findOne(filter).populate({
      path: 'networkCurrencyAddressByNetwork',
      populate: {
        path: 'currency',
        model: 'currencies'
      }
    }).populate({
      path: 'networkCurrencyAddressByNetwork',
      populate: {
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      }
    })
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound), stringHelper.strErrorNetwrokNotFound);

  });

  router.get('/by/ferrum/network/identifier/:ferrumNetworkIdentifier', async (req: any, res: any) => {

    var filter = { ferrumNetworkIdentifier: req.params.ferrumNetworkIdentifier }
    let network = await db.Networks.findOne(filter).populate({
      path: 'networkCurrencyAddressByNetwork',
      populate: {
        path: 'currency',
        model: 'currencies'
      }
    }).populate({
      path: 'networkCurrencyAddressByNetwork',
      populate: {
        path: 'networkDex',
        populate: {
          path: 'dex',
          model: 'decentralizedExchanges'
        }
      }
    })
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound), stringHelper.strErrorNetwrokNotFound);

  });

  router.get('/list', async (req: any, res: any) => {

    var filter: any = {};
    let netwroks = [];
    var sort = { createdAt: -1 }

    if (req.query.isAllowedOnMultiSwap) {

      if (req.query.isAllowedOnMultiSwap == 'true') {
        filter.isAllowedOnMultiSwap = true;
      } else {
        filter.isAllowedOnMultiSwap = false;
      }

    }

    if (req.query.isActive) {

      if (req.query.isActive == 'true') {
        filter.isActive = true;
      } else {
        filter.isActive = false;
      }

    }

    if (req.query.isPagination != null && req.query.isPagination == 'false') {

      netwroks = await db.Networks.find(filter).populate('parentId')
        .sort(sort)

    } else {

      netwroks = await db.Networks.find(filter).populate('parentId')
        .sort(sort)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)

    }

    return res.http200({
      netwroks: netwroks
    });

  });

};
