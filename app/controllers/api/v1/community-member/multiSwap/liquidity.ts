var mongoose = require('mongoose');

module.exports = function (router: any) {

  router.get('/avaialable', asyncMiddleware(async (req: any, res: any) => {

    let address = null;
    let fromNetwork = null;
    let fromCabn = null;
    let liquidity = null;

    if (!req.query.fromCabnId || !req.query.fromNetworkId) {
      return res.http400('fromCabnId & fromNetworkId are required.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.query.fromCabnId) || !mongoose.Types.ObjectId.isValid(req.query.fromNetworkId)) {
      return res.http400('Invalid fromCabnId or fromNetworkId');
    }

    if (req.user) {
      address = await db.Addresses.findOne({ user: req.user._id })
    }

    fromNetwork = await db.Networks.findOne({ _id: req.query.fromNetworkId })
    fromCabn = await db.CurrencyAddressesByNetwork.findOne({ _id: req.query.fromCabnId }).populate('currency')

    if (address && fromNetwork && fromCabn) {
      req.query.bridgeContractAddress = fromNetwork.contractAddress;
      liquidity = await web3Helper.getAvaialableLiquidity(fromNetwork, fromCabn, req.query.bridgeContractAddress);
      return res.http200({
        data: {liquidity: liquidity}
      });
    }

    return res.http400('Invalid fromCabnId or fromNetworkId');

  }));

};
