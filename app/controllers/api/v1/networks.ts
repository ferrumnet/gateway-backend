module.exports = function (router: any) {

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
    return network ? res.http200({ network }) : res.http400(await commonFunctions.getValueFromStringsPhrase(stringHelper.strErrorNetwrokNotFound),stringHelper.strErrorNetwrokNotFound);

  });
};
