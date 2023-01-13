var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/receipt/by/hash/:txId', asyncMiddleware(async (req: any, res: any) => {

    let sourceNetwork = null;

    if (!req.params.txId || !req.query.sourceNetworkId) {
      return res.http400('txId & sourceNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.sourceNetworkId)) {
      return res.http400('Invalid sourceNetworkId');
    }

    sourceNetwork = await db.Networks.findOne({ _id: req.query.sourceNetworkId });

    return res.http200({
      receipt: await swapTransactionHelper.getTransactionReceiptReceiptForApi(sourceNetwork, req.params.txId)
    })
  }));

};
