
const { db, asyncMiddleware, commonFunctions } = global
const mailer = global.mailer;
const { result } = require('lodash');
var mongoose = require('mongoose');

module.exports = function (router) {

  router.get('/token-holders/list', async (req, res) => {
    var filter = {}

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

  async function getCabnTokenHolders(req, res, filter) {
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
