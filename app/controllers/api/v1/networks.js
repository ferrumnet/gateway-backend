const { db, asyncMiddleware, commonFunctions, stringHelper } = global

module.exports = function (router) {

  router.get('/', async (req, res) => {

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
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound),stringHelper.strErrorNetwrokNotFound);

  });
};
