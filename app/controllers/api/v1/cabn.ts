module.exports = function (router: any) {

  router.get('/token-holders/list', async (req: any, res: any) => {
    var filter: any = {}

    if (req.query.cabnId) {
      filter.currencyAddressesByNetwork = req.query.cabnId
    } else {
      return res.http400('cabnId is required.');
    }

    let result = await getCabnTokenHolders(req, res, filter)

    return res.http200({
      totalItems: result.length,
      result: result
    });

  });

  async function getCabnTokenHolders(req: any, res: any, filter: any) {
    let result = []
    let keys = ['_id', 'tokenHolderAddress', 'tokenHolderQuantity', 'currentBlock']

    if (req.query.isPagination != null && req.query.isPagination == 'false') {
      result = await db.TokenHoldersCurrencyAddressesByNetwork.find(filter, keys)
      if (result.length == 0) {
        result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(filter, keys)
      }
    } else {
      result = await db.TokenHoldersCurrencyAddressesByNetwork.find(filter, keys)
        .skip(req.query.offset ? parseInt(req.query.offset) : 0)
        .limit(req.query.limit ? parseInt(req.query.limit) : 10)

      if (result.length == 0) {
        result = await db.TokenHoldersCurrencyAddressesByNetworkSnapShot.find(filter, keys)
          .skip(req.query.offset ? parseInt(req.query.offset) : 0)
          .limit(req.query.limit ? parseInt(req.query.limit) : 10)
      }
    }

    return result
  }

};
